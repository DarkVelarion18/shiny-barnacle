import type { PropsWithChildren, HTMLAttributes } from "react";

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

const Container = ({ children, className, ...rest }: Props) => {
  const base = "container mx-auto px-5";
  const cls = className ? `${base} ${className}` : base;
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
};

export default Container;
