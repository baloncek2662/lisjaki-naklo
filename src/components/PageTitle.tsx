import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

const PageTitle = () => {
  const { pathname } = useLocation();
  const title = pathname.replace(/\/+$/, "") === "/zasebnost"
    ? "Zasebnost in piškotki | ŠD Lisjaki Naklo"
    : "ŠD Lisjaki Naklo | Uradna stran športnega društva";

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

export default PageTitle;
