import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      phone,
      message,
    } = body;

    // VALIDASI

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone dan message wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    // FORMAT NOMOR

    let target =
      phone.replace(/\D/g, "");

    if (target.startsWith("0")) {
      target =
        "62" + target.slice(1);
    }

    // SEND TO FONNTE

    const response = await fetch(
      "https://api.fonnte.com/send",
      {
        method: "POST",

        headers: {
          Authorization:
            process.env
              .FONNTE_TOKEN || "",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          target,

          message,
          countryCode: "62",
        }),
      }
    );

    const result =
      await response.json();

    // SUCCESS

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengirim WhatsApp",
      },
      {
        status: 500,
      }
    );
  }
}