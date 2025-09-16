import { SMTP_EMAIL, SMTP_PASS } from "@/lib/constants/env";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { to, subject, text } = await req.json();

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: SMTP_EMAIL,
    //     pass: SMTP_PASS,
    //   },
    // });

    // await transporter.sendMail({
    //   from: "bezs <gnvv2002@gmail.com>",
    //   to,
    //   subject,
    //   text,
    // });

    const { data, error } = await resend.emails.send({
      from: "Bezs <noreply@naveenraj.dev>",
      to: [to],
      subject,
      text,
    });

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
