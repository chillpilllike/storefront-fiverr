"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { useSwipeable } from "react-swipeable";

interface HeroImage {
	id: string;
	name: string;
	thumbnail: {
		url: string | undefined | null;
		alt: string | undefined | null;
	};
	slug: string;
}

export default function Component({ images }: { images: HeroImage[] }) {
	const [currentImage, setCurrentImage] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentImage((prevImage) => (prevImage + 1) % images.length);
		}, 5000);

		return () => clearInterval(timer);
	}, [images.length]);

	const goToPrevious = () => {
		setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length);
	};

	const goToNext = () => {
		setCurrentImage((prevImage) => (prevImage + 1) % images.length);
	};

	const handlers = useSwipeable({
		onSwipedLeft: () => goToNext(),
		onSwipedRight: () => goToPrevious(),
		trackMouse: true,
	});

	return (
		<div {...handlers} className="relative mt-5 h-[400px] w-full md:h-[700px]">
			{images.map((image, index) => (
				<LinkWithChannel key={image.id} href={`/products/${images[currentImage].slug}`} passHref>
					<div
						className={`absolute inset-0 transition-opacity duration-1000 ${
							index === currentImage ? "opacity-100" : "opacity-0"
						}`}
					>
						<Image
							src={image.thumbnail.url || "/placeholder.png"}
							alt={image.thumbnail.alt || `Hero image ${index + 1}`}
							fill
							className="object-cover object-center"
							priority={index === 0}
						/>
						<div className="absolute bottom-0 left-8 right-8 bg-black bg-opacity-50 p-4 text-white">
							<h2 className="text-2xl font-bold">{image.name}</h2>
							<p className="mt-2">Click to view product</p>
						</div>
					</div>
				</LinkWithChannel>
			))}
			<button
				onClick={goToPrevious}
				className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white"
				aria-label="Previous image"
			>
				<ChevronLeft className="h-6 w-6" />
			</button>
			<button
				onClick={goToNext}
				className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white"
				aria-label="Next image"
			>
				<ChevronRight className="h-6 w-6" />
			</button>
			<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
				{images.map((_, index) => (
					<button
						key={index}
						className={`h-3 w-3 rounded-full ${index === currentImage ? "bg-white" : "bg-gray-400"}`}
						onClick={() => setCurrentImage(index)}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
