/**
 * Email Sending API Route
 * Handles sending emails via:
 * - Ethereal (test mode, virtual mailbox)
 * - Resend (real delivery with simple API key)
 * - Custom SMTP
 */

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendEmailRequest {
  // Mode: 'test' for Ethereal, 'resend' for Resend API, 'smtp' for custom SMTP
  mode: "test" | "resend" | "smtp";
  // Resend API Key (required for 'resend' mode)
  resendApiKey?: string;
  // SMTP Configuration (required for 'smtp' mode)
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  // Email Content
  email: {
    from?: string;
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();

    // Validate email content
    if (!body.email?.to || !body.email?.subject || !body.email?.html) {
      return NextResponse.json(
        { error: "Missing email content (to, subject, html)" },
        { status: 400 }
      );
    }

    // Handle Resend mode
    if (body.mode === "resend") {
      if (!body.resendApiKey) {
        return NextResponse.json({ error: "Missing Resend API Key" }, { status: 400 });
      }

      const resend = new Resend(body.resendApiKey);

      // Use Resend's default from address if not provided
      const fromAddress = body.email.from || "Mail Studio <onboarding@resend.dev>";

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: body.email.to,
        subject: body.email.subject,
        html: body.email.html,
        text: body.email.text || undefined,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        messageId: data?.id,
        mode: "resend",
        realDelivery: true,
      });
    }

    // Handle Ethereal test mode and SMTP mode with nodemailer
    let transporter: nodemailer.Transporter;
    let fromAddress: string;
    let previewUrl: string | null = null;

    if (body.mode === "test") {
      // Create Ethereal test account automatically
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      fromAddress = `"Mail Studio Test" <${testAccount.user}>`;
    } else {
      // Validate SMTP configuration for custom mode
      if (!body.smtp?.host || !body.smtp?.auth?.user || !body.smtp?.auth?.pass) {
        return NextResponse.json({ error: "Missing SMTP configuration" }, { status: 400 });
      }

      if (!body.email?.from) {
        return NextResponse.json({ error: "Missing sender email address" }, { status: 400 });
      }

      transporter = nodemailer.createTransport({
        host: body.smtp.host,
        port: body.smtp.port,
        secure: body.smtp.secure,
        auth: {
          user: body.smtp.auth.user,
          pass: body.smtp.auth.pass,
        },
      });

      fromAddress = body.email.from;
    }

    // Send email
    const info = await transporter.sendMail({
      from: fromAddress,
      to: body.email.to,
      subject: body.email.subject,
      html: body.email.html,
      text: body.email.text || "",
    });

    // Get preview URL for test mode (Ethereal)
    if (body.mode === "test") {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      response: info.response,
      previewUrl,
      mode: body.mode,
      realDelivery: body.mode === "smtp",
    });
  } catch (error) {
    console.error("Email send error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to send email";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
