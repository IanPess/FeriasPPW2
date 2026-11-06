import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
//propriedades  - props

// 5.1.5 Propriedades de uma função : props
interface FreatureCardProps {
  title: string,
  description: string,
}

export function FeatureCards( { title, description }: FreatureCardProps ){
   return (
    //5.1.10 - padronização de interface
    <Card className="text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
   )
}
