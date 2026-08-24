import { execSync } from "child_process";

export default function () {
  execSync("astro preview stop", { stdio: "ignore" });
}
