export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">CSS Test Page</h1>
      <p className="text-xl">If you see red background and white text, CSS is working!</p>
      <div className="mt-8 p-4 bg-blue-500 rounded-lg">
        <p>This should be blue with rounded corners</p>
      </div>
    </div>
  )
}