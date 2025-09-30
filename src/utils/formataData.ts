export function formataData(date: Date) {
  if (!date) {
    return "";
  }

  const newDate = new Date(date);

  return newDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}
