import { useLocation, useNavigate, useSearchParams as useSearchParamsRouter } from 'react-router-dom';

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    prefetch: () => {},
  };
}

export function useSearchParams() {
  const [searchParams] = useSearchParamsRouter();
  return searchParams;
}
