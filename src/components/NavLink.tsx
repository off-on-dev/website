import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { cn } from "@/lib/utils";

type NavLinkCompatProps = Omit<NavLinkProps, "className"> & {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink: ForwardRefExoticComponent<NavLinkCompatProps & RefAttributes<HTMLAnchorElement>> = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
