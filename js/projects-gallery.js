import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const createClient = window.supabase?.createClient;
const supabaseLibAvailable = typeof createClient === 'function';

const grid = document.querySelector('#projects-gallery');
const videoGrid = document.querySelector('#projects-video-gallery');
const status = document.querySelector('#gallery-status');
const modal = document.querySelector('#photo-modal');
const modalImage = document.querySelector('#photo-modal-image');
const closeModal = document.querySelector('#photo-modal-close');
const configured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR_') && !SUPABASE_ANON_KEY.includes('YOUR_');
const localPhotos = [
  { id: 'local-1', url: 'assets/projects/project-01.jpeg' },
  { id: 'local-2', url: 'assets/projects/project-02.jpeg' },
  { id: 'local-3', url: 'assets/projects/project-03.jpeg' },
  { id: 'local-4', url: 'assets/projects/project-04.jpeg' },
  { id: 'local-5', url: 'assets/projects/project-05.jpeg' },
  { id: 'local-6', url: 'assets/projects/project-06.jpeg' },
  { id: 'local-7', url: 'assets/projects/project-07.jpeg' },
  { id: 'local-8', url: 'assets/projects/project-08.jpeg' },
  { id: 'local-9', url: 'assets/projects/project-09.jpeg' },
  { id: 'local-10', url: 'assets/projects/project-10.jpeg' },
  { id: 'local-11', url: 'assets/projects/project-11.jpeg' },
  { id: 'local-12', url: 'assets/projects/project-12.jpeg' },
  { id: 'local-13', url: 'assets/projects/project-13.jpeg' }
];

function renderPhotos(photos) {
  grid.innerHTML = '';
  photos.forEach((photo) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'project-photo-button'; button.setAttribute('aria-label', 'Open project photo');
    const img = document.createElement('img'); img.src = photo.url; img.alt = 'RDS road marking and safety project'; img.loading = 'lazy';
    button.appendChild(img);
    button.addEventListener('click', () => { modalImage.src = photo.url; modal.hidden = false; document.body.classList.add('modal-open'); });
    grid.appendChild(button);
  });
}

function renderVideos(videos) {
  videoGrid.innerHTML = '';
  videos.forEach((video) => {
    const card = document.createElement('article'); card.className = 'project-video-card';
    const player = document.createElement('video'); player.src = video.url; player.controls = true; player.preload = 'metadata'; player.playsInline = true;
    player.setAttribute('aria-label', 'RDS road marking and safety project video');
    card.appendChild(player); videoGrid.appendChild(card);
  });
  const videoSection = document.querySelector('#video-gallery-section');
  videoSection.hidden = videos.length === 0;
}

function closePreview() { modal.hidden = true; modalImage.src = ''; document.body.classList.remove('modal-open'); }
closeModal.addEventListener('click', closePreview);
modal.addEventListener('click', (event) => { if (event.target === modal) closePreview(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePreview(); });

renderPhotos(localPhotos);
renderVideos([]);
if (configured && supabaseLibAvailable) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const loadOnlinePhotos = async () => {
    const { data, error } = await supabase.from('project_photos').select('id,file_path,created_at').order('created_at', { ascending: false });
    if (error) { status.textContent = 'The online photo gallery could not be refreshed.'; return; }
    const online = (data || []).map((item) => ({ id: item.id, url: supabase.storage.from('project-photos').getPublicUrl(item.file_path).data.publicUrl }));
    renderPhotos([...online, ...localPhotos]);
  };
  const loadOnlineVideos = async () => {
    const { data, error } = await supabase.from('project_videos').select('id,file_path,created_at').order('created_at', { ascending: false });
    if (error) { status.textContent = 'Photos are available, but the video gallery needs its Supabase video setup.'; renderVideos([]); return; }
    const online = (data || []).map((item) => ({ id: item.id, url: supabase.storage.from('project-videos').getPublicUrl(item.file_path).data.publicUrl }));
    renderVideos(online);
    status.textContent = '';
  };
  const refresh = () => Promise.all([loadOnlinePhotos(), loadOnlineVideos()]);
  refresh();
  supabase.channel('rds-project-gallery-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'project_photos' }, loadOnlinePhotos)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'project_videos' }, loadOnlineVideos)
    .subscribe();
} else {
  status.textContent = 'Online photo and video uploads will appear here after Supabase is configured.';
}
