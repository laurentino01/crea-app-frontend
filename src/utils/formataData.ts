export function formataData(
  date: Date,
  formato: "usuario" | "input" = "usuario"
) {
  if (!date) {
    return "";
  }
  const newDate = new Date(date);

  if (formato === "usuario") {
    return newDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } else {
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
