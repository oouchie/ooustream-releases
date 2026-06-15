/**
 * Twilio Lookup v2 — line-type intelligence for trial abuse detection.
 *
 * VOIP / non-fixed-VOIP numbers (Google Voice, TextNow, etc.) are the classic
 * way abusers spin up "fresh" phone numbers for free trials. This reads the
 * line type so the trial scorer can treat VOIP as a risk signal.
 *
 * Notes:
 *  - Reuses the EXISTING TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN (raw fetch,
 *    matching src/lib/magic-link.ts — this project does NOT use the twilio SDK).
 *  - Lookup is a READ, not a message send, so it is NOT gated by SMS_ENABLED.
 *    It IS gated by TWILIO_LOOKUP_ENABLED so the line-type-intelligence add-on
 *    (a paid Twilio data package, ~$0.005/lookup) can be turned on only after
 *    it's provisioned + the Twilio env vars are confirmed on Vercel.
 *  - Fails OPEN: any error returns isVoip:false so a Lookup outage never blocks
 *    a legitimate customer. Abuse is still caught by card/email/IP signals.
 */

export interface PhoneLineTypeResult {
  lineType?: string;
  isVoip: boolean;
  carrier?: string;
  error?: string;
}

const VOIP_TYPES = new Set(['voip', 'nonFixedVoip']);

export async function lookupPhoneLineType(e164: string): Promise<PhoneLineTypeResult> {
  if (process.env.TWILIO_LOOKUP_ENABLED !== 'true') {
    return { isVoip: false, error: 'lookup_disabled' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return { isVoip: false, error: 'twilio_not_configured' };
  }

  try {
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(
      e164,
    )}?Fields=line_type_intelligence`;
    const res = await fetch(url, {
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
      // Don't let a slow Lookup hang the trial request.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { isVoip: false, error: `twilio_${res.status}` };
    }
    const json = await res.json();
    const lti = json?.line_type_intelligence;
    const lineType: string | undefined = lti?.type ?? undefined;
    return {
      lineType,
      isVoip: lineType ? VOIP_TYPES.has(lineType) : false,
      carrier: lti?.carrier_name ?? undefined,
    };
  } catch (err) {
    return { isVoip: false, error: (err as Error).message };
  }
}
