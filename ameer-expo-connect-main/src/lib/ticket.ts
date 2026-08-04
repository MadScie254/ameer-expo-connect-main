import QRCode from "qrcode";

/**
 * Characters used for ticket number generation.
 * Excludes 0/O and 1/I to prevent door-staff misreads.
 */
const TICKET_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const TICKET_BODY_LENGTH = 8;
const TICKET_PREFIX = "AE26";

/**
 * Generates a crypto-random ticket number like `AE26-7QK3M9XB`.
 * Uses 8 characters from the unambiguous charset above.
 */
export function generateTicketNumber(): string {
  const bytes = new Uint8Array(TICKET_BODY_LENGTH);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes)
    .map((b) => TICKET_CHARSET[b % TICKET_CHARSET.length])
    .join("");
  return `${TICKET_PREFIX}-${body}`;
}

/**
 * Generates a PNG QR code buffer encoding the canonical verify URL for a ticket.
 * The /verify route doesn't exist yet, but encoding a full URL future-proofs
 * tickets so they can be re-scanned without reissuance once the page is built.
 *
 * @param ticketNumber - e.g. "AE26-7QK3M9XB"
 * @returns PNG as a Buffer (server-side only)
 */
export async function generateTicketQrPng(ticketNumber: string): Promise<Buffer> {
  const url = `https://ameerexpo.com/verify/${ticketNumber}`;
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#0C3E6F", // brand navy
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
  return buffer;
}
