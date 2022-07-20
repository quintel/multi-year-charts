import { forwardRef, ForwardedRef } from 'react';
import { useRouter } from 'next/router';

type Props = React.ComponentProps<'a'> & {
  activeClassName?: string;
};

const NavLink = forwardRef(
  (
    { activeClassName, children, className, ...linkProps }: Props,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const router = useRouter();

    let fullClassName = className;
    let ariaCurrent: undefined | 'page' = undefined;

    if (linkProps.href && `${router.asPath}/`.startsWith(`${linkProps.href}/`)) {
      fullClassName = `${fullClassName} ${activeClassName}`.trim();
      ariaCurrent = 'page';
    }

    return (
      <a {...linkProps} aria-current={ariaCurrent} className={fullClassName} ref={ref}>
        {children}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';

export default NavLink;
