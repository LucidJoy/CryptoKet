import { ThemeProvider } from "next-themes";
import Script from "next/script";

import { Navbar, Footer } from "../components";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <div className="dark:bg-nft-dark bg-white min-h-screen">
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>

      <Script
        src="https://kit.fontawesome.com/27ba7154b1.js"
        crossorigin="anonymous"
      />
    </ThemeProvider>
  );
}

export default MyApp;
