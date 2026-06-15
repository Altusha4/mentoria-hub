import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <img src="/logo.png" alt="Mentoria Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Discover Your Future at Mentoria Hub
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Find education opportunities (olympiads, internships, scholarships) and learn asynchronously with our comprehensive courses. Your path to success starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Explore Opportunities
            </Link>
            <Link
              to="/courses"
              className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Mentoria Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Find Opportunities',
                description: 'Discover olympiads, internships, scholarships, and competitions suited to your interests and grade level.',
              },
              {
                icon: '📚',
                title: 'Learn Asynchronously',
                description: 'Take courses at your own pace with video lessons, materials, and mini-tests. No fixed schedules.',
              },
              {
                icon: '📊',
                title: 'Track Progress',
                description: 'Monitor your learning with progress bars, saved opportunities, and personalized recommendations.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join hundreds of students exploring opportunities and learning valuable skills.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
