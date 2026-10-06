import Document, {
    Html,
    Head,
    Main,
    NextScript,
    type DocumentContext,
    type DocumentInitialProps,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

const themeScript = `
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "light" || saved === "dark"
    ? saved
    : (systemDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
`;

export default class MyDocument extends Document {
    static async getInitialProps(
        context: DocumentContext,
    ): Promise<DocumentInitialProps> {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = context.renderPage;

        try {
            context.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) =>
                        sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(context);

            return {
                ...initialProps,
                styles: [initialProps.styles, sheet.getStyleElement()],
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        return (
            <Html lang="de">
                <Head>
                    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
