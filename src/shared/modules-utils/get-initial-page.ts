"server-only";

import { getAppSlugServerOnly } from "@/utils/getAppSlugServerOnly";
import { getRolewiseAppMenuItems } from "./utils";
import { getServerSession } from "@/modules/auth/services/better-auth/action";

export async function getInitialPageServerOnly() {
  const session = await getServerSession();
  const pathname = await getAppSlugServerOnly();
  const appName = pathname.appSlug.split("/")[2];
  const menuItems = getRolewiseAppMenuItems(session?.userRBAC, appName);

  const menuItemPages =
    menuItems?.filter((menuItem) => Boolean(menuItem.icon)) || [];

  const initialPage = menuItemPages[0] || null;

  return initialPage;
}
