/* eslint-disable no-console */
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { ensureStorage } from '../lib/storage';
import { slugify } from '../lib/slugify';
import {
  Admin,
  Category,
  Song,
  SongLyrics,
  SongComment,
  Quote,
  Banner,
  Announcement,
  CalendarEvent,
  HomepageSettings,
  Video,
  Article,
  EventModel,
  SongPlay,
  SongDownload,
  AuditLog,
} from '../models';
import { DEFAULT_SECTIONS } from '../services/homepage';
import { writeToneWav, writeCoverSvg, writeBannerSvg } from './assets';

interface LyricSeed {
  language: string;
  code: string;
  script?: string;
  content: string;
  isDefault?: boolean;
  order: number;
}
interface SongSeed {
  title: string;
  category: string;
  singer: string;
  composer: string;
  lyricist: string;
  freq: number;
  seconds?: number;
  hue: number;
  coverMain: string;
  coverSub: string;
  tags: string[];
  playCount: number;
  isFeatured?: boolean;
  isTop5?: boolean;
  top5Order?: number;
  lyrics: LyricSeed[];
}

const CATEGORIES = [
  { name: 'Annamacharya Sankeertanalu', slug: 'annamacharya-sankeertanalu', description: 'Devotional keertanas composed by Tallapaka Annamacharya.', order: 0 },
  { name: 'Stotras & Slokas', slug: 'stotras-slokas', description: 'Sacred Sanskrit hymns and verses.', order: 1 },
  { name: 'Tyagaraja Kritis', slug: 'tyagaraja-kritis', description: 'Compositions of Saint Tyagaraja.', order: 2 },
  { name: 'Bhajans', slug: 'bhajans', description: 'Popular devotional bhajans.', order: 3 },
];

const SONGS: SongSeed[] = [
  {
    title: 'Brahmam Okkate',
    category: 'annamacharya-sankeertanalu',
    singer: 'Traditional',
    composer: 'Annamacharya',
    lyricist: 'Annamacharya',
    freq: 261.63,
    hue: 28,
    coverMain: 'బ్రహ్మ మొక్కటే',
    coverSub: 'Brahmam Okkate',
    tags: ['annamacharya', 'keertana', 'advaita'],
    playCount: 412,
    isFeatured: true,
    isTop5: true,
    top5Order: 0,
    lyrics: [
      {
        language: 'Telugu',
        code: 'te',
        isDefault: true,
        order: 0,
        content:
          'బ్రహ్మ మొక్కటే పరబ్రహ్మ మొక్కటే\nపరబ్రహ్మ మొక్కటే పరబ్రహ్మ మొక్కటే\n\nకందువగు హీనాధికము లిందు లేవు\nఅందరికి శ్రీహరే అంతరాత్మ\nఇందులో జంతుకుల మింతా ఒక్కటే\nఅందరికి శ్రీహరే అంతరాత్మ',
      },
      {
        language: 'English',
        code: 'en',
        order: 1,
        content:
          'The Absolute is but One, the Supreme Brahman is One.\n\nThere is no high or low among us here;\nfor everyone, Sri Hari is the indwelling Self.\nAll living beings in this world are one and the same;\nfor everyone, Sri Hari is the inner soul.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 2,
        content:
          'brahma mokkaTE parabrahma mokkaTE\n\nkanduvagu hInAdhikamu lindu lEvu\nandariki SrIharE antarAtma\nindulO jantukula mintA okkaTE\nandariki SrIharE antarAtma',
      },
    ],
  },
  {
    title: 'Nanati Bratuku Natakamu',
    category: 'annamacharya-sankeertanalu',
    singer: 'Traditional',
    composer: 'Annamacharya',
    lyricist: 'Annamacharya',
    freq: 293.66,
    hue: 340,
    coverMain: 'నానాటి బ్రతుకు',
    coverSub: 'Nanati Bratuku',
    tags: ['annamacharya', 'keertana', 'vairagya'],
    playCount: 357,
    isTop5: true,
    top5Order: 1,
    lyrics: [
      {
        language: 'Telugu',
        code: 'te',
        isDefault: true,
        order: 0,
        content:
          'నానాటి బ్రతుకు నాటకము\nకానక కన్నది కైవల్యము\n\nపుట్టుటయు నిజము పోవుటయు నిజము\nనట్టనడిమి పని నాటకము\nయెట్టనెదుట కలదీ ప్రపంచము\nకట్టఁగడపటిది కైవల్యము',
      },
      {
        language: 'English',
        code: 'en',
        order: 1,
        content:
          'This day-to-day life is but a play;\nwhat lies unseen beyond it is liberation.\n\nBirth is true, and death is true;\nthe doings in between are mere theatre.\nThis world that stands before our eyes —\nat the very end dissolves in liberation.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 2,
        content:
          'nAnATi bratuku nATakamu\nkAnaka kannadi kaivalyamu\n\npuTTuTayu nijamu pOvuTayu nijamu\nnaTTanaDimi pani nATakamu',
      },
    ],
  },
  {
    title: 'Adivo Alladivo',
    category: 'annamacharya-sankeertanalu',
    singer: 'Traditional',
    composer: 'Annamacharya',
    lyricist: 'Annamacharya',
    freq: 329.63,
    hue: 14,
    coverMain: 'అదివో అల్లదివో',
    coverSub: 'Adivo Alladivo',
    tags: ['annamacharya', 'venkateswara', 'tirumala'],
    playCount: 298,
    isFeatured: true,
    lyrics: [
      {
        language: 'Telugu',
        code: 'te',
        isDefault: true,
        order: 0,
        content:
          'అదివో అల్లదివో శ్రీహరి వాసము\nపదివేల శేషుల పడగల మయము\n\nఅదే వేంకటాచల మఖిలోన్నతము\nఅదివో బ్రహ్మాదుల కపురూపము',
      },
      {
        language: 'English',
        code: 'en',
        order: 1,
        content:
          'Behold, there yonder is the abode of Sri Hari,\nresplendent with the hoods of ten thousand serpents.\n\nThat is Venkatachala, highest of all —\na form rare even for Brahma and the gods to behold.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 2,
        content:
          'adivO alladivO SrIhari vAsamu\npadivEla SEshula paDagala mayamu\n\nadE vEnkaTAchala makhilOnnatamu',
      },
    ],
  },
  {
    title: 'Bhaja Govindam',
    category: 'stotras-slokas',
    singer: 'Traditional',
    composer: 'Adi Shankaracharya',
    lyricist: 'Adi Shankaracharya',
    freq: 392.0,
    hue: 268,
    coverMain: 'भज गोविन्दम्',
    coverSub: 'Bhaja Govindam',
    tags: ['shankara', 'stotra', 'sanskrit'],
    playCount: 388,
    isFeatured: true,
    isTop5: true,
    top5Order: 2,
    lyrics: [
      {
        language: 'Sanskrit',
        code: 'sa',
        script: 'Devanagari',
        isDefault: true,
        order: 0,
        content:
          'भज गोविन्दं भज गोविन्दं\nगोविन्दं भज मूढमते ।\nसम्प्राप्ते सन्निहिते काले\nनहि नहि रक्षति डुकृञ्करणे ॥',
      },
      {
        language: 'English',
        code: 'en',
        order: 1,
        content:
          'Worship Govinda, worship Govinda,\nworship Govinda, O foolish mind!\nWhen the appointed time draws near,\nmere rules of grammar will not save you.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 2,
        content:
          'bhaja govindaṁ bhaja govindaṁ\ngovindaṁ bhaja mūḍhamate |\nsamprāpte sannihite kāle\nnahi nahi rakṣati ḍukṛñkaraṇe ||',
      },
    ],
  },
  {
    title: 'Jagadananda Karaka',
    category: 'tyagaraja-kritis',
    singer: 'Traditional',
    composer: 'Tyagaraja',
    lyricist: 'Tyagaraja',
    freq: 440.0,
    hue: 200,
    coverMain: 'జగదానంద కారక',
    coverSub: 'Jagadananda Karaka',
    tags: ['tyagaraja', 'pancharatna', 'rama'],
    playCount: 341,
    isTop5: true,
    top5Order: 3,
    lyrics: [
      {
        language: 'Telugu',
        code: 'te',
        isDefault: true,
        order: 0,
        content:
          'జగదానంద కారక జయ జానకీ ప్రాణ నాయక\n\nగగన అధిప సత్కులజ రాజ రాజేశ్వర\nసుగుణాకర సురసేవ్య భవ్య దాయక సదా సకల',
      },
      {
        language: 'Sanskrit',
        code: 'sa',
        script: 'Devanagari',
        order: 1,
        content:
          'जगदानन्द कारक जय जानकी प्राण नायक\nगगनाधिप सत्कुलज राज राजेश्वर\nसुगुणाकर सुरसेव्य भव्य दायक सदा सकल',
      },
      {
        language: 'English',
        code: 'en',
        order: 2,
        content:
          'O maker of the world’s joy, victory to You, beloved Lord of Janaki!\nNoble scion of the solar race, sovereign of kings,\nmine of virtues, worshipped by the gods, ever the giver of all that is auspicious.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 3,
        content:
          'jagadānanda kāraka jaya jānakī prāṇa nāyaka\ngaganādhipa satkulaja rāja rājeśvara\nsuguṇākara surasevya bhavya dāyaka sadā sakala',
      },
    ],
  },
  {
    title: 'Achyutam Keshavam',
    category: 'bhajans',
    singer: 'Traditional',
    composer: 'Traditional',
    lyricist: 'Traditional',
    freq: 349.23,
    hue: 150,
    coverMain: 'अच्युतं केशवम्',
    coverSub: 'Achyutam Keshavam',
    tags: ['bhajan', 'krishna', 'rama'],
    playCount: 274,
    isFeatured: true,
    lyrics: [
      {
        language: 'Sanskrit',
        code: 'sa',
        script: 'Devanagari',
        isDefault: true,
        order: 0,
        content:
          'अच्युतं केशवं राम नारायणं\nकृष्ण दामोदरं वासुदेवं हरिम् ।\nश्रीधरं माधवं गोपिकावल्लभं\nजानकीनायकं रामचन्द्रं भजे ॥',
      },
      {
        language: 'Hindi',
        code: 'hi',
        script: 'Devanagari',
        order: 1,
        content:
          'अच्युत, केशव, राम और नारायण,\nकृष्ण, दामोदर, वासुदेव, हरि,\nश्रीधर, माधव, गोपियों के प्रिय,\nजानकी के स्वामी रामचन्द्र को मैं भजता हूँ।',
      },
      {
        language: 'English',
        code: 'en',
        order: 2,
        content:
          'Achyuta, Keshava, Rama, Narayana,\nKrishna, Damodara, Vasudeva, Hari,\nShridhara, Madhava, beloved of the gopis —\nI worship Ramachandra, the Lord of Janaki.',
      },
      {
        language: 'Roman Transliteration',
        code: 'roman',
        order: 3,
        content:
          'acyutaṁ keśavaṁ rāma nārāyaṇaṁ\nkṛṣṇa dāmodaraṁ vāsudevaṁ harim |\nśrīdharaṁ mādhavaṁ gopikāvallabhaṁ\njānakīnāyakaṁ rāmacandraṁ bhaje ||',
      },
    ],
  },
];

const QUOTES = [
  { text: 'You have the right to perform your duty, but never to its fruits.', author: 'Bhagavad Gita 2.47', language: 'English' },
  { text: 'The soul is neither born, nor does it ever die.', author: 'Bhagavad Gita 2.20', language: 'English' },
  { text: 'Whenever righteousness declines, I manifest Myself.', author: 'Bhagavad Gita 4.7', language: 'English' },
  { text: 'Where there is Krishna and Arjuna, there is prosperity and victory.', author: 'Bhagavad Gita 18.78', language: 'English' },
  { text: 'सर्वं खल्विदं ब्रह्म — All this is verily Brahman.', author: 'Chandogya Upanishad', language: 'Sanskrit' },
];

const FESTIVALS = [
  { name: 'Sankranti', key: 'sankranti', month: 1, day: 14, description: 'The harvest festival marking the sun’s northward journey.' },
  { name: 'Republic Day', key: 'republic_day', month: 1, day: 26, description: 'National celebration of the Constitution of India.' },
  { name: 'Ugadi', key: 'ugadi', month: 3, day: 19, description: 'Telugu and Kannada New Year.' },
  { name: 'Sri Rama Navami', key: 'rama_navami', month: 3, day: 26, description: 'Celebrating the birth of Lord Rama.' },
  { name: 'Guru Purnima', key: 'guru_purnima', month: 7, day: 29, description: 'A day of reverence to one’s guru.' },
  { name: 'Independence Day', key: 'independence_day', month: 8, day: 15, description: 'Commemorating India’s independence.' },
  { name: 'Krishna Janmashtami', key: 'krishna_janmashtami', month: 9, day: 4, description: 'Celebrating the birth of Lord Krishna.' },
  { name: 'Diwali', key: 'diwali', month: 11, day: 8, description: 'The festival of lights.' },
];

const bucketDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

async function run(): Promise<void> {
  ensureStorage();
  await connectDB(env.MONGODB_URI);
  console.log('Seeding database:', env.MONGODB_URI);

  console.log('  • clearing existing collections');
  await Promise.all([
    Admin.deleteMany({}),
    Category.deleteMany({}),
    Song.deleteMany({}),
    SongLyrics.deleteMany({}),
    SongComment.deleteMany({}),
    Quote.deleteMany({}),
    Banner.deleteMany({}),
    Announcement.deleteMany({}),
    CalendarEvent.deleteMany({}),
    HomepageSettings.deleteMany({}),
    Video.deleteMany({}),
    Article.deleteMany({}),
    EventModel.deleteMany({}),
    SongPlay.deleteMany({}),
    SongDownload.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // Drop any stale indexes (e.g. a previously-built lyrics text index) and rebuild from schema.
  await SongLyrics.syncIndexes().catch(() => undefined);

  // Admin
  const admin = new Admin({ username: env.ADMIN_USERNAME.toLowerCase(), email: env.ADMIN_EMAIL, role: 'ADMIN' });
  await admin.setPassword(env.ADMIN_PASSWORD);
  await admin.save();
  console.log('  • created admin:', admin.username);

  // Categories
  const catBySlug = new Map<string, { _id: unknown }>();
  for (const c of CATEGORIES) {
    const doc = await Category.create(c);
    catBySlug.set(c.slug, doc);
  }
  console.log(`  • created ${CATEGORIES.length} categories`);

  // Songs + lyrics + assets + plays
  const songDocs: Array<{ _id: unknown; isFeatured: boolean; isTop5: boolean; top5Order: number }> = [];
  for (let idx = 0; idx < SONGS.length; idx += 1) {
    const s = SONGS[idx];
    const slug = slugify(s.title);
    const seconds = s.seconds ?? 9;
    const coverRef = await writeCoverSvg(`cover-${slug}.svg`, s.coverMain, s.coverSub, s.hue);
    const audioRef = await writeToneWav('songs', `audio-${slug}.wav`, s.freq, seconds);
    const duration = Math.round(seconds);

    const song = await Song.create({
      title: s.title,
      slug,
      category: catBySlug.get(s.category)!._id,
      singer: s.singer,
      composer: s.composer,
      lyricist: s.lyricist,
      duration,
      audioFile: audioRef,
      coverImage: coverRef,
      playCount: s.playCount,
      downloadCount: Math.floor(s.playCount / 12),
      isFeatured: Boolean(s.isFeatured),
      isTop5: Boolean(s.isTop5),
      top5Order: s.top5Order ?? 0,
      languages: s.lyrics.map((l) => l.language),
      tags: s.tags,
      status: 'published',
      publishedAt: new Date(),
    });
    // stagger createdAt so "recently added" ordering is meaningful
    // (use the native driver so Mongoose does not ignore the managed timestamp)
    await Song.collection.updateOne(
      { _id: song._id } as Record<string, unknown>,
      { $set: { createdAt: new Date(Date.now() - idx * 3_600_000) } },
    );

    for (const l of s.lyrics) {
      await SongLyrics.create({
        song: song._id,
        language: l.language,
        languageCode: l.code,
        script: l.script,
        content: l.content,
        isDefault: Boolean(l.isDefault),
        order: l.order,
      });
    }

    // analytics plays (a sample; some today, spread over 30 days)
    const playsToSeed = Math.min(45, Math.round(s.playCount / 9));
    const plays = [];
    for (let i = 0; i < playsToSeed; i += 1) {
      const daysAgo = i < playsToSeed * 0.35 ? 0 : Math.floor((i / playsToSeed) * 30);
      plays.push({ song: song._id, dateBucket: bucketDaysAgo(daysAgo) });
    }
    if (plays.length) await SongPlay.insertMany(plays);

    songDocs.push({ _id: song._id, isFeatured: song.isFeatured, isTop5: song.isTop5, top5Order: song.top5Order });
  }
  console.log(`  • created ${SONGS.length} songs with multi-language lyrics`);

  // Comments (mix of approved + pending) on the first two songs
  await SongComment.insertMany([
    { song: songDocs[0]._id, name: 'Lakshmi', rating: 5, comment: 'Such a profound keertana. The Telugu and English side-by-side is wonderful!', status: 'approved' },
    { song: songDocs[0]._id, name: 'Ravi Kumar', email: 'ravi@example.com', rating: 5, comment: 'Brahmam Okkate — timeless wisdom of Annamacharya.', status: 'approved' },
    { song: songDocs[0]._id, name: 'Anonymous Devotee', rating: 4, comment: 'Could you add a Tamil translation too?', status: 'pending' },
    { song: songDocs[1]._id, name: 'Sita', rating: 5, comment: 'The transliteration helps me sing along. Thank you!', status: 'approved' },
    { song: songDocs[3]._id, name: 'Guru Prasad', rating: 5, comment: 'Bhaja Govindam never gets old. 🙏', status: 'approved' },
  ]);
  console.log('  • created sample comments (approved + pending)');

  // Quotes
  await Quote.insertMany(QUOTES.map((q) => ({ ...q, mode: 'random', isActive: true })));

  // Announcement
  await Announcement.create({
    message: '🎵 Welcome to Vijayavipanchi — new keertanas and multi-language lyrics are added regularly.',
    isActive: true,
    order: 0,
  });

  // Calendar festivals + a guaranteed entry for today
  await CalendarEvent.insertMany(FESTIVALS.map((f) => ({ name: f.name, festivalKey: f.key, month: f.month, day: f.day, year: 2026, description: f.description })));
  const now = new Date();
  const todayFestival = FESTIVALS.find((f) => f.month === now.getMonth() + 1 && f.day === now.getDate());
  if (!todayFestival) {
    await CalendarEvent.create({
      name: 'Nitya Sankeertana Seva',
      festivalKey: 'generic',
      month: now.getMonth() + 1,
      day: now.getDate(),
      description: 'Daily devotional singing in the Vijayavipanchi tradition.',
    });
  }

  // Festival banner (today's festival if any, else a generic welcome banner)
  const bannerTitle = todayFestival ? todayFestival.name : 'Hari Om — Welcome';
  const bannerKey = (todayFestival?.key ?? 'generic') as never;
  const festivalImage = await writeBannerSvg('banners', 'festival.svg', bannerTitle, 'Wishing you peace, music and devotion', 32);
  await Banner.create({ festivalKey: bannerKey, title: bannerTitle, subtitle: 'Wishing you peace, music and devotion', image: festivalImage, isActive: true, order: 0 });

  // Hero slides
  const hero1Image = await writeBannerSvg('banners', 'hero-1.svg', 'Vijayavipanchi', 'Cultural music & multi-language lyrics', 28);
  const hero2Image = await writeBannerSvg('banners', 'hero-2.svg', 'Annamacharya Sankeertanalu', 'Timeless keertanas, many languages', 320);

  // One video, article, event to populate the homepage sections
  const videoThumb = await writeBannerSvg('videos', 'video-thumb-1.svg', 'Brahmam Okkate', 'Annamacharya Keerthana', 30);
  await Video.create({
    title: 'Brahmam Okkate — Annamacharya Keerthana',
    slug: 'brahmam-okkate-live',
    description: 'A soulful rendition of the timeless keertana.',
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: videoThumb,
    category: 'Keerthana',
    isFeatured: true,
    status: 'published',
    publishedAt: new Date(),
  });

  const articleCover = await writeBannerSvg('article_images', 'article-1.svg', 'Annamacharya', 'The Timeless Wisdom of his Sankeertanas', 18);
  await Article.create({
    title: 'The Timeless Wisdom of Annamacharya’s Sankeertanas',
    slug: 'timeless-wisdom-of-annamacharya',
    excerpt: 'How a 15th-century poet-saint distilled the deepest truths of Vedanta into singable Telugu verses.',
    body: '<p>Tallapaka Annamacharya composed an estimated 32,000 sankeertanas in praise of Lord Venkateswara...</p><p>His verse <em>Brahmam Okkate</em> proclaims the oneness of the divine across all beings.</p>',
    coverImage: articleCover,
    author: 'Editorial',
    tags: ['annamacharya', 'history'],
    status: 'published',
    publishedAt: new Date(),
  });

  await EventModel.create({
    title: 'Sankeertana Aradhana 2026',
    slug: 'sankeertana-aradhana-2026',
    description: 'An evening of collective devotional singing.',
    startDate: new Date(Date.now() + 30 * 86_400_000),
    location: 'Tirumala',
    status: 'published',
  });

  // Homepage settings
  const top5 = songDocs.filter((s) => s.isTop5).sort((a, b) => a.top5Order - b.top5Order).map((s) => s._id);
  const featured = songDocs.filter((s) => s.isFeatured).map((s) => s._id);
  await HomepageSettings.create({
    singleton: 'singleton',
    sections: DEFAULT_SECTIONS,
    heroSlides: [
      { title: 'Welcome to Vijayavipanchi', subtitle: 'Devotional music & multi-language lyrics', image: hero1Image, link: '/songs' },
      { title: 'Annamacharya Sankeertanalu', subtitle: 'Explore timeless keertanas', image: hero2Image, link: '/songs?category=annamacharya-sankeertanalu' },
    ],
    top5Songs: top5.slice(0, 5),
    featuredSongs: featured,
    recentlyAddedMode: 'auto',
    mostPlayedMode: 'auto',
    quoteMode: 'random',
  });

  await AuditLog.create({ adminUsername: admin.username, action: 'seed', entity: 'System', meta: { songs: SONGS.length } });

  console.log('\n✅ Seed complete.');
  console.log('   Admin login:');
  console.log(`     username: ${env.ADMIN_USERNAME}`);
  console.log(`     password: ${env.ADMIN_PASSWORD}`);
  console.log('   (change these via backend/.env before production)\n');

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
