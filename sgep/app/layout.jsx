import "./globals.css";

export const metadata = {
  title: "SGEP — Sistema de Gestão de Entregas e Projetos",
  description:
    "Sistema de gestão de entregas e projetos do DIGEP/CGPE — INPI. Monitoramento de carga de trabalho, planos mensal e anual, e dashboards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
