
export enum FileValidationResult {
  Pass = 1,
  Failed = 2,
  Warning = 3,
  NotChecked = 0
}

export interface ClientFileValidationResultModel {
  validationType?: string;
  validationResult?: FileValidationResult;
  expedtedValue?: string;
  foundValue?: string;
  msg?: string;
}
