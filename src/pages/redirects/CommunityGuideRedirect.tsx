import { redirect } from "react-router";

export function clientLoader() {
  return redirect("/handbook");
}

export default function CommunityGuideRedirect() {
  return null;
}
