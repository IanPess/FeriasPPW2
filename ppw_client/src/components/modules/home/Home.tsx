import   { FeatureCards } from "@/components/cards/FeatureCards";
import { LeadForm } from "./LeadForm";


export default function Home() {
  // props do nosso card - reutilização de componentes
  const feature = [
    { title: "React & Next ", description: "Página SPA"},
    { title: "Nest Backend ", description: "Arquitetura REST API para server side" },
    { title: "shadcn /ui ", description: "Padroniação de interfaces  "}
  ];

  return (
    // 5.1.1 Concetio de SPA ( Single Page Application )
    <main className="container mx-auto py-12 px-4 text-center space-y-12">
      <section>
        <h1>Curso Tecnologia de Sistemas para Internet</h1>
        <p>Cadastre-se para receber novidades</p>
        <LeadForm/>
      </section>

      { /*  5.1.9 Reutilização de componentes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        { feature.map((f)=>(
          <FeatureCards key={f.title} title={f.title} description={f.description}  />
        ))}
      </section>
    </main>
  )
}
