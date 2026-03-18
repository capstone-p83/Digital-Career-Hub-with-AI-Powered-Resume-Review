import React from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Mail, Briefcase, History, FileText, Settings } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const { language } = useAppContext();

  // Mock data for demo
  const history = [
    { id: '1', date: '2024-03-15', role: 'Frontend Developer', score: 85 },
    { id: '2', date: '2024-03-10', role: 'UI Designer', score: 78 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Profile Info */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">John Doe</h2>
            <p className="text-zinc-500 mb-6">Software Engineering Student</p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3 text-zinc-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">john.doe@example.com</span>
              </div>
              <div className="flex items-center space-x-3 text-zinc-600">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">Target: Full Stack Developer</span>
              </div>
            </div>

            <button className="w-full mt-8 bg-zinc-100 text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="bg-emerald-600 rounded-2xl p-8 text-white">
            <h3 className="text-lg font-bold mb-2">Career Readiness</h3>
            <div className="text-4xl font-bold mb-4">82%</div>
            <div className="w-full bg-emerald-700 rounded-full h-2 mb-4">
              <div className="bg-white h-full rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="text-emerald-100 text-sm">You're doing great! Complete 2 more resume reviews to reach 90%.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 flex items-center space-x-2">
                <History className="w-6 h-6 text-emerald-600" />
                <span>Review History</span>
              </h2>
              <button className="text-emerald-600 font-bold text-sm hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <FileText className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{item.role}</h4>
                      <p className="text-zinc-500 text-sm">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-600">{item.score}%</div>
                    <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Score</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">Recommended for You</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-1">Interview Prep</h4>
                <p className="text-sm text-zinc-500">Top 50 React Interview Questions</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-1">Skill Building</h4>
                <p className="text-sm text-zinc-500">Advanced TypeScript Patterns</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
