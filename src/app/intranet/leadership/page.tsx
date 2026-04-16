import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { 
  Building2, Globe, Users, ExternalLink, 
  ChevronRight, AlertCircle, ArrowRight
} from 'lucide-react'
import LeaderCard from '@/components/leadership/LeaderCard'

export default async function LeadershipPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Fetch all users via queryRaw to bypass client validation and ensure we get all database columns
  const rawUsers = await prisma.$queryRaw<any[]>`SELECT * FROM User`;
  
  // Debug log
  console.log(`Leadership Debug: CWD: ${process.cwd()}`);
  console.log(`Leadership Debug: Total raw users: ${rawUsers.length}`);
  
  const allLeaders = rawUsers.filter(u => {
    const tier = u.leadershipTier;
    return tier !== null && tier !== undefined && tier !== '';
  });

  console.log(`Leadership Debug: All potential leaders found: ${allLeaders.length}`);
  
  // Sort them manually if needed, or by tier in JS
  allLeaders.sort((a, b) => {
    const tierA = (a.leadershipTier || '').toString();
    const tierB = (b.leadershipTier || '').toString();
    return tierA.localeCompare(tierB);
  });

  // Executive Data - Hardcoded as requested "dedicated areas" and "direct develop"
  const executiveTeam = {
    founder: {
      name: "Dr. Sarath Jayatissa",
      title: "FOUNDER CHAIRMAN",
      image: "/founder.JPG",
      quote: `It gives me great pleasure to welcome you all to Leeds Connect, the official intranet platform of Leeds International School.

From our humble beginnings to becoming a strong network of schools, one of the key strengths of LEEDS has always been our people. Today, with over 1,000 dedicated employees across our branches, the need to stay connected, informed, and inspired has never been more important.

Leeds Connect is more than just a digital platform—it is a space that brings our entire LEEDS family together. It enables us to share ideas, exchange knowledge, celebrate achievements, and stay aligned with our common goals. Through this platform, every member of our team has a voice and an opportunity to contribute towards the growth and success of our organisation.

I strongly encourage each of you to actively engage with Leeds Connect—share your thoughts, recognise your colleagues, and make use of the resources available. Together, let us build a culture of collaboration, transparency, and continuous improvement.

As we continue our journey forward, platforms like Leeds Connect will play a vital role in strengthening our unity and driving us towards excellence.

Wishing you all the very best.

Deshamanya Dr. Sarath Jayatissa
Founder & Chairman
Leeds International School`
    },
    chairperson: {
      name: "Mrs. Malithi Jayatissa",
      title: "CHAIRPERSON",
      image: "/chairperson.JPG",
      bio: "Strategic leader guiding the corporate governance of LEEDS International Group and ensuring the vision of LEEDS remains steadfast across its expanding network."
    },
    directors: [
      {
        name: "Mr. Tilina Diyagama",
        title: "MANAGING DIRECTOR",
        image: "/tilina.JPG",
        bio: "Driving the operational growth and efficiency of the group with a focus on modern management standards.",
      },
      {
        name: "Mrs. Hemamala Jayatissa",
        title: "DIRECTRESS",
        image: "/hemamala.JPG",
        bio: "Dedicated to academic curriculum and maintaining the high educational standards LEEDS is known for.",
      },
      {
        name: "Ms. Kinithi Jayatissa",
        title: "DIRECTRESS",
        image: "/kinithi.JPG",
        bio: "Passionate about early childhood development and innovative learning methodologies.",
      }
    ]
  };

  // Group Dynamic Tiers for the Grid sections below the Directors
  // Increasing limits and making sections more robust
  const coordinatorsRaw = allLeaders.filter(u => u.leadershipTier === 'COORDINATOR')
  const coordinators = coordinatorsRaw.slice(0, 12)
  const coordinatorsOverLimit = coordinatorsRaw.length > 12

  const networkRaw = allLeaders.filter(u => u.leadershipTier === 'NETWORK')
  const network = networkRaw.slice(0, 12)
  const networkOverLimit = networkRaw.length > 12

  const branchRaw = allLeaders.filter(u => u.leadershipTier === 'BRANCH')
  const branch = branchRaw.slice(0, 25)
  const branchOverLimit = branchRaw.length > 25

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 p-8 pb-24 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-20 animate-in fade-in duration-1000">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-[#5A2D82] leading-tight">
              LEEDS <span className="text-gold-leeds">LEADERSHIP</span>
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">
              Strategic Governance & Corporate Direction
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/directory" className="px-8 py-3.5 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2">
              Corporate Directory <ExternalLink className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>

        {/* ── 1. CORPORATE LEADERSHIP (TOP TIER) ── */}
        <section className="space-y-12">
          {/* Founder & Chairperson Parallel - HORIZONTAL RECTANGLES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-1.5 h-6 bg-gold-leeds rounded-full" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-wider">The Founder</h2>
              </div>
              <LeaderCard 
                name={executiveTeam.founder.name}
                title={executiveTeam.founder.title}
                image={executiveTeam.founder.image}
                quote={executiveTeam.founder.quote}
                variant="horizontal"
                imagePosition="object-[center_25%]"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-wider">The Chairperson</h2>
              </div>
              <LeaderCard 
                name={executiveTeam.chairperson.name}
                title={executiveTeam.chairperson.title}
                image={executiveTeam.chairperson.image}
                bio={executiveTeam.chairperson.bio}
                variant="horizontal"
                imagePosition="object-[center_20%]"
              />
            </div>
          </div>

          {/* 3 Board Directors - ELEGANT SQUARES */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
              <div className="w-1.5 h-6 bg-primary/20 rounded-full" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-wider">Board of <span className="text-primary">Directors</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {executiveTeam.directors.map((director) => (
                <LeaderCard 
                  key={director.name}
                  name={director.name}
                  title={director.title}
                  image={director.image}
                  bio={director.bio}
                  variant="square"
                  imagePosition="object-[center_40%]"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. NETWORK COORDINATION & LEADERSHIP (9 Grids) ── */}
        <section className="space-y-8 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Network <span className="text-primary">Coordination</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Cross-region academic and operational excellence</p>
            </div>
            <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 tracking-widest uppercase">Max 12 Grids</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coordinators.map((leader) => (
              <LeaderCard 
                key={leader.id}
                name={leader.name || ''}
                title={leader.leadershipTitle || 'Coordinator'}
                image={leader.image || '/leadership_placeholder.png'}
                bio={leader.bio || ''}
                variant="small"
              />
            ))}
            
            {coordinatorsOverLimit && (
              <div className="flex flex-col items-center justify-center gap-4 bg-red-50/5 p-10 rounded-[2rem] border-2 border-dashed border-red-200">
                <AlertCircle className="w-10 h-10 text-red-400/50" />
                <div className="text-center">
                  <p className="text-red-600 font-black text-sm tracking-[0.2em] uppercase">Allocated Space is Over</p>
                  <p className="text-red-400/80 text-[10px] font-medium mt-1">Contact HR to extend this section</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. NETWORK LEADERSHIP (8 Grids) ── */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Network <span className="text-primary">Leadership</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Senior regional management and oversight</p>
            </div>
            <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 tracking-widest uppercase">Max 12 Grids</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {network.map((item) => (
              <LeaderCard 
                key={item.id}
                name={item.name || ''}
                title={item.leadershipTitle || 'Network Leader'}
                image={item.image || '/leadership_placeholder.png'}
                bio={item.bio || ''}
                variant="small"
              />
            ))}

            {networkOverLimit && (
              <div className="col-span-1 flex flex-col items-center justify-center gap-4 bg-red-50/5 p-10 rounded-[2rem] border-2 border-dashed border-red-200">
                <AlertCircle className="w-8 h-8 text-red-400/50" />
                <p className="text-red-600 font-black text-xs text-center tracking-widest uppercase">Space Over</p>
              </div>
            )}
          </div>
        </section>

        {/* ── 4. BRANCH LEADERSHIP (20 Grids) ── */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Branch <span className="text-primary">Leadership</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Principals and academic heads of individual locations</p>
            </div>
            <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 tracking-widest uppercase">Max 25 Grids</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {branch.map((item) => (
              <LeaderCard 
                key={item.id}
                name={item.name || ''}
                title={item.leadershipTitle || 'Branch Head'}
                image={item.image || '/leadership_placeholder.png'}
                bio={item.bio || ''}
                variant="small"
              />
            ))}

            {branchOverLimit && (
              <div className="col-span-1 flex flex-col items-center justify-center gap-4 bg-red-50/5 p-10 rounded-[2rem] border-2 border-dashed border-red-200">
                <AlertCircle className="w-6 h-6 text-red-400/50" />
                <p className="text-red-600 font-black text-[10px] text-center tracking-widest uppercase leading-tight">Allocated<br/>Space Over</p>
              </div>
            )}
          </div>
        </section>

        {allLeaders.length === 0 && !executiveTeam.founder && (
           <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 uppercase tracking-[0.2em]">Repository Empty</h3>
             <p className="text-gray-400 text-xs mt-2 font-medium">Use the Admin panel to populate leadership profiles.</p>
           </div>
        )}
      </div>
    </div>
  )
}
