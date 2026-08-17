import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfigRow from "./config-row";

// Seed keys shown even if not yet in the database — an OPERATOR should
// see the full config surface, not just whatever's been touched so far.
const KNOWN_KEYS = ["display_name", "support_email", "feature_flag_beta_invoices"];

export default async function ConfigPage() {
  const currentUser = await getCurrentUser();
  const settings = await prisma.configSetting.findMany();
  const settingsByKey = Object.fromEntries(settings.map((s) => [s.key, s]));

  return (
    <div>
      <h1 className="mb-8 text-lg font-semibold">Environment config</h1>
      <div>
        {KNOWN_KEYS.map((key) => (
          <ConfigRow
            key={key}
            configKey={key}
            value={settingsByKey[key]?.value ?? ""}
            canEdit={currentUser.role === "ADMIN"}
          />
        ))}
      </div>
    </div>
  );
}
