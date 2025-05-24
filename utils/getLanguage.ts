import { DEFAULT_LANGUAGE } from "constants/config";

export default function getLanguage(lang?: string) {
  return DEFAULT_LANGUAGE ||lang ;
}
