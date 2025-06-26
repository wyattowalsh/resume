import { Basics } from '@/lib/schema';
import {
	FaExternalLinkAlt,
	FaLinkedinIn,
	FaMapPin
} from 'react-icons/fa';
import { CiMail } from 'react-icons/ci';
import { FiGithub } from 'react-icons/fi';
import { SlScreenSmartphone } from 'react-icons/sl';
import { Separator } from './ui/separator';

function Ornament({ reversed }: { reversed?: boolean }) {
	return (
		<div
			className={`hidden items-center gap-2 md:flex ${
				reversed ? 'flex-row-reverse' : ''
			}`}
		>
			<div
				className={`h-px w-12 bg-gradient-to-${
					reversed ? 'l' : 'r'
				} from-transparent to-muted-foreground/30`}
			/>
			<div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
			<div className="h-px w-6 bg-muted-foreground/30" />
			<div className="h-px w-px rounded-full bg-muted-foreground/30" />
		</div>
	);
}

type HeaderProps = {
	basics: Basics;
};

export function Header({ basics }: HeaderProps) {
	const { city, region } = basics.location;
	const locationString = `${city}, ${region}`;
	const gmapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
		locationString,
	)}`;

	return (
		<header className="flex flex-col items-center justify-start gap-2 text-center">
			<div className="flex items-center gap-4">
				<Ornament />
				<a href={basics.url} target="_blank" rel="noopener noreferrer">
					<h1 className="shrink-0 text-4xl font-bold text-gradient-textured p-0 m-0">
						{basics.name}
					</h1>
				</a>
				<Ornament reversed />
			</div>
			<div className="flex flex-wrap justify-center gap-x-6 text-xs text-muted-foreground">
				<a
					href={`mailto:${basics.email}`}
					className="flex items-center gap-2 transition-colors hover:text-primary"
				>
					<CiMail size={18} strokeWidth={1.5} style={{ stroke: "#B5826A" }} />
					{basics.email}
				</a>
				<a
					href={`tel:${basics.phone}`}
					className="flex items-center gap-2 transition-colors hover:text-primary"
				>
					<SlScreenSmartphone
						size={18}
						strokeWidth={2}
						style={{ stroke: "#B5A76A", fill: "#B5A76A" }}
					/>
					{basics.phone}
				</a>
				{basics.location && (
					<a
						href={gmapsQueryUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 transition-colors hover:text-primary"
					>
						<FaMapPin size={18} style={{ fill: "#E63946" }} />
						{locationString}
					</a>
				)}
				{Array.isArray(basics.profiles) &&
					basics.profiles.map((profile) => (
						<a
							key={profile.network}
							href={profile.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 transition-colors hover:text-primary"
						>
							{profile.network === "LinkedIn" && (
								<FaLinkedinIn size={18} style={{ fill: "#0072b1" }} />
							)}
							{profile.network === "GitHub" && <FiGithub size={18} />}
							{profile.username}
						</a>
					))}
			</div>
			{basics.summary && (
				<>
					<Separator style={{ width: "50%" }} className="my-0 py-0" />
					<p className="max-w-4xl p-0 m-0 text-xs text-muted-foreground">
						{basics.summary}
					</p>
				</>
			)}
		</header>
	);
}
