import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import https from "https";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'pncp-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/pncp/datas/')) {
            try {
              const urlParts = req.url.replace('/api/pncp/datas/', '').split('/');
              if (urlParts.length >= 3) {
                const [cnpj, ano, seq] = urlParts;
                const targetUrl = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpj}/compras/${ano}/${seq}`;

                const fetchGovData = (url: string, resObj: any) => {
                  https.get(url, {
                    rejectUnauthorized: false,
                    headers: {
                      'Accept': 'application/json',
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                  }, (proxiedRes) => {
                    if (proxiedRes.statusCode === 301 || proxiedRes.statusCode === 302 || proxiedRes.statusCode === 307) {
                      const redirectUrl = proxiedRes.headers.location;
                      if (redirectUrl) {
                        return fetchGovData(redirectUrl, resObj);
                      }
                    }

                    let rawData = '';
                    proxiedRes.on('data', (chunk) => { rawData += chunk; });
                    proxiedRes.on('end', () => {
                      resObj.setHeader('Content-Type', 'application/json');
                      resObj.setHeader('Access-Control-Allow-Origin', '*');
                      if (proxiedRes.statusCode !== 200) {
                        console.error(`[PNCP Proxy] Erro Status ${proxiedRes.statusCode} from ${url}`);
                        resObj.end(JSON.stringify({ error: `Gov returned ${proxiedRes.statusCode}` }));
                        return;
                      }
                      resObj.end(rawData);
                    });
                  }).on('error', (err) => {
                    console.error("[PNCP Proxy] Request error: ", err.message);
                    resObj.statusCode = 500;
                    resObj.setHeader('Access-Control-Allow-Origin', '*');
                    resObj.end(JSON.stringify({ error: err.message }));
                  });
                };

                fetchGovData(targetUrl, res);
                return;
              }
            } catch (err: any) {
              console.error("[PNCP Proxy] Intercept Error: ", err);
              res.statusCode = 500;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
