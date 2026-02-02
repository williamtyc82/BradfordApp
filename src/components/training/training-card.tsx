import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingMaterial } from "@/lib/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FileType, Video, File } from "lucide-react";

const typeIconMap = {
    pdf: FileType,
    video: Video,
    image: File
}

export function TrainingCard({ material }: { material: TrainingMaterial }) {
    const Icon = typeIconMap[material.fileType];
    const image = PlaceHolderImages.find(img => img.id.startsWith(`training-${material.fileType}`));

    const handleViewMaterial = () => {
        if (material.fileURL) {
            window.open(material.fileURL, '_blank', 'noopener,noreferrer');
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                <div className="mb-2">
                    {image && (
                         <Image 
                         src={image.imageUrl}
                         alt={material.title}
                         width={600}
                         height={400}
                         className="rounded-lg object-cover aspect-video"
                         data-ai-hint={image.imageHint}
                       />
                    )}
                </div>
                <CardTitle>{material.title}</CardTitle>
                <CardDescription className="line-clamp-2">{material.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Badge variant="secondary">{material.category}</Badge>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleViewMaterial}>
                    <Icon className="mr-2 h-4 w-4" />
                    View Material
                </Button>
            </CardFooter>
        </Card>
    );
}
