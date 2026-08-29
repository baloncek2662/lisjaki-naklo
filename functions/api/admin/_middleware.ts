import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import { jsonResponse, type TournamentEnv } from "../../../server/tournament-api";

const accessDomainPattern = /^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i;

export const onRequest: PagesFunction<TournamentEnv> = async (context) => {
  const domain = context.env.ACCESS_TEAM_DOMAIN?.replace(/\/$/, "");
  const aud = context.env.ACCESS_AUD?.trim();

  if (!domain || !aud || !accessDomainPattern.test(domain)) {
    return jsonResponse({ error: "Cloudflare Access is not configured." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const validateAccess = cloudflareAccessPlugin({
    domain: domain as `https://${string}.cloudflareaccess.com`,
    aud,
  });
  return validateAccess(context);
};
