"use client";
import { Button, EmptyState } from "@brofit/ui";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="container page-space">
      <EmptyState
        title="No pudimos cargar este espacio."
        action={<Button onClick={reset}>Intentar de nuevo ↗</Button>}
      >
        Ocurrió un error. Puedes volver a intentarlo.
      </EmptyState>
    </div>
  );
}
