import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { isServer, getRequestEvent } from "solid-js/web";
import "./app.css";

export default function App() {
  const url = isServer ? getRequestEvent()?.request.url : undefined;
  return (
    <Router
      url={url}
      root={(props) => (
        <MetaProvider>
          <Title>Enclave</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
