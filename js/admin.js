import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const createClient = window.supabase?.createClient;
const supabaseLibAvailable = typeof createClient === 'function';

const loginPanel = document.querySelector('#login-panel');
const uploadPanel = document.querySelector('#upload-panel');
const loginForm = document.querySelector('#login-form');
const message = document.querySelector('#admin-message');
const photoInput = document.querySelector('#photo-files');
const videoInput = document.querySelector('#video-files');
const photoButton = document.querySelector('#upload-button');
const videoButton = document.querySelector('#upload-video-button');
const photoGrid = document.querySelector('#admin-photo-grid');
const videoGrid = document.querySelector('#admin-video-grid');
const photoCount = document.querySelector('#selected-count');
const videoCount = document.querySelector('#selected-video-count');
const configured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR_') && !SUPABASE_ANON_KEY.includes('YOUR_');
const PHOTO_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 50 * 1024 * 1024;

if (!configured) {
  loginPanel.innerHTML = '<h2>Supabase setup required</h2><p>Add your Supabase project URL and anon public key in <code>js/supabase-config.js</code>. Follow <code>SUPABASE-SETUP.md</code>.</p>';
} else if (!supabaseLibAvailable) {
  loginPanel.innerHTML = '<h2>Admin library unavailable</h2><p>The bundled Supabase library could not be loaded. Do not retry with administrator credentials until the page is restored.</p>';
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const setMessage = (text) => { message.textContent = text; };

  photoInput.addEventListener('change', () => {
    const count = photoInput.files?.length || 0;
    photoCount.textContent = count ? `${count} photo${count === 1 ? '' : 's'} selected.` : 'No photos selected yet.';
  });
  videoInput.addEventListener('change', () => {
    const count = videoInput.files?.length || 0;
    videoCount.textContent = count ? `${count} video${count === 1 ? '' : 's'} selected.` : 'No videos selected yet.';
  });

  const showSession = async (session) => {
    if (!session) { loginPanel.classList.remove('hidden'); uploadPanel.classList.add('hidden'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      loginPanel.classList.remove('hidden'); uploadPanel.classList.add('hidden');
      alert('This account is not authorised as an RDS admin.');
      return;
    }
    loginPanel.classList.add('hidden'); uploadPanel.classList.remove('hidden');
    await Promise.all([loadAdminPhotos(), loadAdminVideos()]);
  };

  async function loadAdminPhotos() {
    const { data, error } = await supabase.from('project_photos').select('id,file_path').order('created_at', { ascending: false });
    if (error) { setMessage(`Photo list: ${error.message}`); return; }
    photoGrid.innerHTML = '';
    if (!data?.length) photoGrid.innerHTML = '<p class="admin-message">No uploaded photos yet.</p>';
    (data || []).forEach((photo) => {
      const { data: publicData } = supabase.storage.from('project-photos').getPublicUrl(photo.file_path);
      const card = document.createElement('div'); card.className = 'admin-photo';
      const img = document.createElement('img'); img.src = publicData.publicUrl; img.alt = 'Uploaded project photo';
      const del = document.createElement('button'); del.className = 'btn btn-dark'; del.type = 'button'; del.textContent = 'Delete photo';
      del.addEventListener('click', async () => {
        if (!confirm('Delete this project photo from the public gallery?')) return;
        del.disabled = true; del.textContent = 'Deleting…';
        const { error: storageError } = await supabase.storage.from('project-photos').remove([photo.file_path]);
        if (storageError) { setMessage(storageError.message); del.disabled = false; del.textContent = 'Delete photo'; return; }
        const { error: rowError } = await supabase.from('project_photos').delete().eq('id', photo.id);
        if (rowError) { setMessage(rowError.message); return; }
        setMessage('Photo deleted.'); await loadAdminPhotos();
      });
      card.append(img, del); photoGrid.appendChild(card);
    });
  }

  async function loadAdminVideos() {
    const { data, error } = await supabase.from('project_videos').select('id,file_path').order('created_at', { ascending: false });
    if (error) { setMessage(`Video list: ${error.message}. Run the video SQL in SUPABASE-SETUP.md.`); return; }
    videoGrid.innerHTML = '';
    if (!data?.length) videoGrid.innerHTML = '<p class="admin-message">No uploaded videos yet.</p>';
    (data || []).forEach((video) => {
      const { data: publicData } = supabase.storage.from('project-videos').getPublicUrl(video.file_path);
      const card = document.createElement('div'); card.className = 'admin-photo admin-video-card';
      const player = document.createElement('video'); player.src = publicData.publicUrl; player.controls = true; player.preload = 'metadata'; player.playsInline = true;
      const del = document.createElement('button'); del.className = 'btn btn-dark'; del.type = 'button'; del.textContent = 'Delete video';
      del.addEventListener('click', async () => {
        if (!confirm('Delete this video from the public Projects gallery?')) return;
        del.disabled = true; del.textContent = 'Deleting…';
        const { error: storageError } = await supabase.storage.from('project-videos').remove([video.file_path]);
        if (storageError) { setMessage(storageError.message); del.disabled = false; del.textContent = 'Delete video'; return; }
        const { error: rowError } = await supabase.from('project_videos').delete().eq('id', video.id);
        if (rowError) { setMessage(rowError.message); return; }
        setMessage('Video deleted.'); await loadAdminVideos();
      });
      card.append(player, del); videoGrid.appendChild(card);
    });
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#admin-email').value;
    const password = document.querySelector('#admin-password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }
    await showSession(data.session);
  });

  photoButton.addEventListener('click', async () => {
    const files = Array.from(photoInput.files || []);
    if (!files.length) { setMessage('Choose at least one photo first.'); return; }
    photoButton.disabled = true; photoButton.textContent = 'Uploading…';
    let uploaded = 0; let failed = 0;
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > PHOTO_LIMIT) { setMessage(`Skipped ${file.name}: use JPG, PNG or WebP up to 10 MB.`); failed++; continue; }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('project-photos').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) { setMessage(`Could not upload ${file.name}: ${uploadError.message}`); failed++; continue; }
      const { error: rowError } = await supabase.from('project_photos').insert({ file_path: filePath });
      if (rowError) { await supabase.storage.from('project-photos').remove([filePath]); setMessage(`Could not publish ${file.name}: ${rowError.message}`); failed++; } else uploaded++;
    }
    photoInput.value = ''; photoCount.textContent = 'No photos selected yet.'; photoButton.disabled = false; photoButton.textContent = 'Upload selected photos';
    setMessage(`Photo upload finished: ${uploaded} uploaded, ${failed} failed or skipped.`); await loadAdminPhotos();
  });

  videoButton.addEventListener('click', async () => {
    const files = Array.from(videoInput.files || []);
    if (!files.length) { setMessage('Choose at least one video first.'); return; }
    videoButton.disabled = true; videoButton.textContent = 'Uploading videos…';
    let uploaded = 0; let failed = 0;
    for (const file of files) {
      if (!['video/mp4', 'video/webm'].includes(file.type) || file.size > VIDEO_LIMIT) { setMessage(`Skipped ${file.name}: use MP4 or WebM up to 50 MB.`); failed++; continue; }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('project-videos').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) { setMessage(`Could not upload ${file.name}: ${uploadError.message}`); failed++; continue; }
      const { error: rowError } = await supabase.from('project_videos').insert({ file_path: filePath });
      if (rowError) { await supabase.storage.from('project-videos').remove([filePath]); setMessage(`Could not publish ${file.name}: ${rowError.message}`); failed++; } else uploaded++;
    }
    videoInput.value = ''; videoCount.textContent = 'No videos selected yet.'; videoButton.disabled = false; videoButton.textContent = 'Upload selected videos';
    setMessage(`Video upload finished: ${uploaded} uploaded, ${failed} failed or skipped.`); await loadAdminVideos();
  });

  document.querySelector('#logout-button').addEventListener('click', async () => { await supabase.auth.signOut(); await showSession(null); });
  supabase.auth.getSession().then(({ data }) => showSession(data.session));
  supabase.auth.onAuthStateChange((_event, session) => { showSession(session); });
}
