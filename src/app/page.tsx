import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Welcome to Polly</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create, share, and participate in polls with ease. Get instant feedback and visualize results in real-time.
        </p>
        
        <div className="flex gap-4 mb-12">
          <Link 
            href="/polls"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Browse Polls
          </Link>
          <Link 
            href="/create-poll"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition"
          >
            Create a Poll
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 w-full">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-blue-600 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Easy to Create</h3>
            <p className="text-gray-600">Create polls in seconds with our intuitive interface. Add multiple options and customize settings.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
            <p className="text-gray-600">Watch results update in real-time as people vote. Beautiful charts make data easy to understand.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-blue-600 text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-600">Share your polls with a simple link. Reach your audience on any platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
