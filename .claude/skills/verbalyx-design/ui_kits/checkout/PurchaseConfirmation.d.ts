import * as React from "react";

/**
 * Confirmación post-compra. La fecha del cobro va en grande porque es el
 * dato que evita la disputa; "Gestionar suscripción" es visible desde el
 * primer segundo, no escondido en ajustes.
 */
export interface PurchaseConfirmationProps {
  plan?: string;
  trial?: boolean;
  chargeDate?: string;
  amount?: string;
  email?: string;
  onOpenApp?: () => void;
  onManage?: () => void;
}

export declare function PurchaseConfirmation(props: PurchaseConfirmationProps): React.ReactElement;
