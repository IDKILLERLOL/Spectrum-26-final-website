import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, children, ...props }: any) {
  let to = href;
  if (href && href.startsWith('/events/') && href !== '/events/prize-pool' && href !== '/events') {
    to = href.replace('/events/', '/event/');
  }
  return (
    <RouterLink to={to} {...props}>
      {children}
    </RouterLink>
  );
}
