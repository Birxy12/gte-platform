import { supabase } from '../lib/supabase'

function Upload() {
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const { data, error } = await supabase.storage
      .from('reels')
      .upload(`${Date.now()}_${file.name}`, file)

    if (error) {
      console.error('Upload error:', error)
      alert('Error uploading file. Check console for details.')
    } else {
      console.log('Uploaded successfully:', data)
      alert('File uploaded successfully!')
    }
  }

  return (
    <div className="upload-component">
      <input type="file" onChange={handleUpload} />
    </div>
  )
}

export default Upload
