import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, Star, RefreshCw } from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';
import { roomStart, roomSuccess, roomFailure } from '../store/roomSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const { rooms, loading } = useSelector((state) => state.room);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopRooms();
  }, []);

  const fetchTopRooms = async () => {
    dispatch(roomStart());
    try {
      const res = await api.get('/rooms/top-featured');
      dispatch(roomSuccess(res.data));
    } catch (err) {
      console.error('Error fetching rooms:', err);
      dispatch(roomFailure(err.message || 'Could not load rooms'));
      toast.error('Could not load featured rooms');
    }
  };

  const fakeReviews = [
    {
      id: 1,
      name: 'Radha Bhavana',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      stars: 5,
      comment: 'Absolute perfection! The room service was incredibly fast, and the bed felt like sleeping on a cloud. Will definitely return next month.'
    },
    {
      id: 2,
      name: 'Nikhil Agrawal',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      stars: 5,
      comment: 'Stunning decor and a very polite staff. The kids loved the suite, and the view from the 12th floor was absolutely breathtaking!'
    },
    {
      id: 3,
      name: 'Arjun Kumar K',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      stars: 5,
      comment: 'The amenities were top-notch. High-speed internet, premium coffee machine in the room, and an extremely clean layout. 10/10 recommendation!'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="relative h-[650px] w-full flex items-center justify-center bg-black overflow-hidden">
        <img 
          src="https://wallpapercave.com/wp/wp1846105.jpg" 
          alt="Luxury Hotel Hero"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none filter brightness-[0.7]"
        />
        <div className="absolute top-0 left-0 w-full h-[20%] backdrop-blur-md bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none z-10"></div>

  
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none z-0"></div>

    
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10 space-y-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-tight text-white drop-shadow-lg">
            Book comfortable rooms <br/>
            <span className="text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">at the best price</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-350 text-sm md:text-base leading-relaxed drop-shadow">
            Enjoy a smooth, secure, and hassle-free hotel booking experience.
          </p>
          
        
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 max-w-sm mx-auto sm:max-w-none">
            <Link 
              to="/rooms"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3.5 font-bold transition-all flex items-center justify-center uppercase tracking-wider text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Book Now</span>
            </Link>
            <Link 
              to="/rooms"
              className="w-full sm:w-auto bg-transparent border border-slate-700 hover:border-amber-500 hover:text-amber-500 text-slate-200 px-8 py-3.5 font-bold transition-all flex items-center justify-center uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Rooms</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 border-b border-slate-900/60">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-200 tracking-tight uppercase">Comfortable Stays</h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
          We offer a perfect blend of comfort, quality, and exceptional hospitality to make 
    every guest feel at home. Our well-designed rooms, modern amenities, and dedicated 
    services ensure a relaxing and enjoyable experience throughout your stay. Whether 
    you are visiting for business, family holidays, or a weekend escape, we provide a 
    peaceful environment with clean spaces, excellent facilities, and reliable support. 
    Our goal is to create memorable moments by delivering a safe, comfortable, and 
    convenient stay where every guest receives warm hospitality and personalized care.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Featured Rooms</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Handpicked selection of our top rooms featuring premium amenities and design</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
            <span>Loading comfortable rooms...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div 
                key={room._id} 
                className="group flex flex-col bg-slate-900 border border-slate-850 hover:border-amber-500/30 overflow-hidden shadow-xl transition-all duration-300 rounded-2xl"
              >
          
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600'}
                    alt={`Room ${room.roomNumber}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-500 font-mono">
                    ₹{room.price} / night
                  </div>
                </div>

          
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-slate-350 line-clamp-3 leading-relaxed">
                      {room.description || 'Experience premium amenities, plush bedding, and high-speed fiber internet.'}
                    </p>
                  </div>

              
                  <button
                    onClick={() => navigate(`/rooms?roomDetailsId=${room._id}`)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] mt-auto"
                  >
                    View & Book Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Guest Experiences</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Read honest feedback and ratings directly from our verified guests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {fakeReviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-slate-900/60 backdrop-blur-sm border border-slate-850 p-6 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300 shadow-lg"
            >
              <div>
       
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                
                <p className="text-slate-350 text-xs italic leading-relaxed mb-6">
                  "{review.comment}"
                </p>
              </div>

            
              <div className="flex items-center gap-3 border-t border-slate-850/60 pt-4 mt-auto">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-500/10"
                />
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">{review.name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
