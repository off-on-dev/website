import { redirect } from "react-router";

export function clientLoader() {
  return redirect("/#challenges");
}

export default function TopicsTagRedirect() {
  return null;
}
