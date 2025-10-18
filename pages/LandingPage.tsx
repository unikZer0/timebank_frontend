import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UsersIcon, BriefcaseIcon, HeartIcon } from '@heroicons/react/24/outline';



const LandingPage: React.FC = () => {
  return (
    <div className="bg-background flex flex-col min-h-screen text-primary-text">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2970&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-background/70"></div>
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-prompt text-primary-text">ร่วมสร้างสังคมแห่งการแบ่งปัน</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl text-secondary-text">เวลาและทักษะของคุณมีค่า มาแลกเปลี่ยนเพื่อสร้างสรรค์ชุมชนที่เข้มแข็ง</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/search" className="bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg shadow-accent/20">
                ค้นหากิจกรรม/บริการ
              </Link>
              <Link to="/register" className="bg-surface backdrop-blur-sm text-primary-text border border-border-color font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 hover:bg-muted shadow-lg">
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-surface">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-primary-text mb-4 font-prompt">คลังเวลาคืออะไร?</h2>
                <p className="text-secondary-text max-w-3xl mx-auto mb-12">คลังเวลาคือแนวคิดที่สมาชิกสามารถ "ฝาก" เวลาโดยการช่วยเหลือผู้อื่น และ "ถอน" เวลาเมื่อต้องการความช่วยเหลือ โดยใช้เวลาเป็นสื่อกลางในการแลกเปลี่ยนแทนเงิน</p>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center">
                        <div className="bg-accent-light p-5 rounded-full mb-4"><UsersIcon className="w-10 h-10 text-accent" /></div>
                        <h3 className="text-xl font-bold mb-2 text-primary-text">สร้างชุมชน</h3>
                        <p className="text-secondary-text">เชื่อมโยงผู้คนในชุมชนให้ใกล้ชิดกันมากขึ้นผ่านการช่วยเหลือซึ่งกันและกัน</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-accent-light p-5 rounded-full mb-4"><BriefcaseIcon className="w-10 h-10 text-accent" /></div>
                        <h3 className="text-xl font-bold mb-2 text-primary-text">แลกเปลี่ยนทักษะ</h3>
                        <p className="text-secondary-text">ทุกคนมีทักษะที่สามารถแบ่งปันได้ ไม่ว่าจะเป็นการสอน, การซ่อมแซม, หรืองานฝีมือ</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-accent-light p-5 rounded-full mb-4"><HeartIcon className="w-10 h-10 text-accent" /></div>
                        <h3 className="text-xl font-bold mb-2 text-primary-text">เท่าเทียมกัน</h3>
                        <p className="text-secondary-text">เวลาของทุกคนมีค่าเท่ากัน หนึ่งชั่วโมงของคุณเท่ากับหนึ่งชั่วโมงของคนอื่นเสมอ</p>
                    </div>
                </div>
            </div>
        </section>



      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
