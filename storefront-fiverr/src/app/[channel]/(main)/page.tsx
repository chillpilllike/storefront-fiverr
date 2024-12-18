import { CollectionListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import HeroSlider from "@/ui/components/HeroSlider";
import { ProductList } from "@/ui/components/ProductList";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
	title: "SecretGreen: Your Trusted Source for Home Improvement, DIY, and Garden Tools",
	description:
		"Discover high-quality home improvement, DIY, and garden tools at SecretGreen. From innovative gardening solutions to reliable DIY essentials, we empower your projects with tools built for performance and durability. Shop now for unbeatable quality and value!",
};

export default async function HomePage({ params }: { params: { channel: string } }) {
	const data = await executeGraphQL(CollectionListDocument, {
		//@ts-ignore
		variables: {
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!data.collections?.edges || !data.heroImages?.edges) {
		return null;
	}

	const collections = data.collections.edges.map(({ node }) => node);
	const heroImages = data.heroImages.edges.map(({ node }) => node);

	return (
		<div className="mx-auto max-w-7xl">
			<HeroSlider
				images={heroImages.map((node) => {
					return {
						id: node.id,
						name: node.name,
						thumbnail: {
							url: node.media?.[0]?.url || "",
							alt: node.media?.[0]?.alt || "",
						},
						slug: node.slug,
					};
				})}
			/>
			<section className="p-8 pb-16">
				{collections.map((collection) => (
					<div key={collection.id} className="mb-16">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="text-2xl font-medium text-neutral-900">{collection.name}</h2>
							<LinkWithChannel
								href={`/collections/${collection.slug}`}
								className="text-primary hover:text-primary/80 group inline-flex items-center text-sm font-medium"
							>
								View all
								<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
							</LinkWithChannel>
						</div>
						<ProductList products={collection.products?.edges.map(({ node }) => node) || []} />
					</div>
				))}
			</section>
		</div>
	);
}
