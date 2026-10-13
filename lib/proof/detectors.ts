// What the humanizer's output scored on third-party detectors, as measured
// in one dated test. DetectorProof renders this on the landings, /precios
// and the paywall.
//
// Empty until the Cowork test table and its methodology page exist, and it
// stays empty rather than holding a placeholder: an example arc at 80 % is
// already a claim, and the landing FAQ promises we do not make that claim
// without showing how it was measured. With no results, nothing renders.

export interface DetectorResult {
  /** The detector's own name, as it would appear in its marketing. */
  name: string;
  /** Share of the test texts it classified as human, 0–100. */
  humanPct: number;
}

export interface DetectorProofData {
  /** ISO date of the test run. */
  testedAt: string;
  /** Where the method and the test texts are published. */
  methodologyUrl: string;
  results: DetectorResult[];
}

export const DETECTOR_PROOF: DetectorProofData = {
  testedAt: "",
  methodologyUrl: "",
  results: [],
};
