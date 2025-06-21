import resumeData from '../assets/data/resume.json';
import { Certificates } from './components/Certificates';
import { Education } from './components/Education';
import { Header } from './components/Header';
import { Projects } from './components/Projects';
import { Publications } from './components/Publications';
import { Skills } from './components/Skills';
import { WorkExperience } from './components/WorkExperience';
import { HR } from './components/ui/HR';
import { resumeSchema } from './lib/schema';
import {
	FaBriefcase,
	FaGraduationCap,
	FaBrain,
	FaDiagramProject,
	FaCertificate,
	FaBookOpen,
} from 'react-icons/fa6';

function App() {
	const resume = resumeSchema.parse(resumeData);

	return (
		<main className="container mx-auto my-8 max-w-4xl rounded-xl p-0 print:my-0 print:max-w-full print:border-none print:shadow-none">
			<Header basics={resume.basics} />
			<HR icon={<FaBriefcase />} />
			<WorkExperience work={resume.work} />
			<HR icon={<FaGraduationCap />} />
			<Education education={resume.education} />
			<HR icon={<FaDiagramProject />} />
			<Projects projects={resume.projects} />
			{resume.skills && resume.skills.length > 0 && (
				<>
					<HR icon={<FaBrain />} />
					<Skills skills={resume.skills} />
				</>
			)}
			<div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
				<section>
					<HR icon={<FaCertificate />} />
					<Certificates certificates={resume.certificates} />
				</section>
				<section>
					<HR icon={<FaBookOpen />} />
					<Publications publications={resume.publications} />
				</section>
			</div>
		</main>
	);
}

export default App; 