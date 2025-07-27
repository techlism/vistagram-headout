import { nanoid } from "nanoid";
import { generate } from "random-words";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { generatePresignedUrl, uploadImageToR2 } from "@/lib/storage";

function getRandomCaptionForCategory(category: string): string | null {
    // Map similar categories to existing caption groups
    const categoryMappings: { [key: string]: string } = {
        nature: "nature",
        landscape: "nature",
        forest: "nature",
        garden: "nature",
        park: "nature",
        desert: "nature",
        beach: "beach",
        ocean: "ocean",
        harbor: "ocean",
        boat: "ocean",
        lighthouse: "ocean",
        sunset: "sunset",
        sunrise: "sunset",
        morning: "sunset",
        mountains: "mountains",
        snow: "winter",
        winter: "winter",
        coffee: "coffee",
        cafe: "coffee",
        tea: "coffee",
        breakfast: "coffee",
        food: "food",
        cooking: "food",
        baking: "food",
        restaurant: "food",
        market: "food",
        dinner: "food",
        lunch: "food",
        wine: "food",
        beer: "food",
        cocktail: "food",
        city: "city",
        urban: "city",
        night: "city",
        building: "city",
        street: "street",
        alley: "street",
        subway: "street",
        architecture: "architecture",
        interior: "architecture",
        bridge: "architecture",
        castle: "architecture",
        church: "architecture",
        museum: "architecture",
        library: "architecture",
        flowers: "flowers",
        spring: "flowers",
        summer: "flowers",
        autumn: "flowers",
        workspace: "workspace",
        technology: "workspace",
        art: "art",
        gallery: "art",
        vintage: "art",
        abstract: "art",
        minimalism: "art",
        music: "music",
        concert: "music",
        festival: "music",
        book: "books",
        travel: "travel",
        lifestyle: "travel",
        car: "travel",
        bicycle: "travel",
        train: "travel",
        plane: "travel",
        fitness: "fitness",
        sports: "fitness",
        yoga: "fitness",
        meditation: "fitness",
    };

    const mappedCategory = categoryMappings[category] || "nature";
    const captions =
        CATEGORY_CAPTIONS[mappedCategory] || CATEGORY_CAPTIONS.nature;

    // 80% chance of having a caption
    if (Math.random() > 0.2) {
        return getRandomItem(captions);
    }
    return null;
}

// Category-specific captions with varying lengths
const CATEGORY_CAPTIONS: { [key: string]: string[] } = {
    nature: [
        "Nature's masterpiece 🌿",
        "Lost in the wilderness and loving every moment of it. These ancient trees have stories to tell 🌲✨",
        "Morning hike rewards! The fresh air and incredible views make every early wake-up call worth it",
        "Wild and free 🦋",
        "Found this hidden gem after hours of exploring. Nature never ceases to amaze me with its untouched beauty and perfect compositions",
    ],
    beach: [
        "Salt in my hair, sun on my face ☀️",
        "Beach therapy session complete! Nothing beats the sound of waves washing away all your worries and stress",
        "Ocean vibes only 🌊",
        "Spent the entire day here and still don't want to leave. The endless horizon and perfect weather have me completely mesmerized",
        "Paradise found 🏖️",
    ],
    ocean: [
        "Endless blue horizons 🌊",
        "The ocean's power and beauty never fails to humble me. Standing here watching the waves crash reminds me how small we really are",
        "Deep blue dreams ✨",
        "Hours of meditation by the water's edge. The rhythmic sound of waves is nature's perfect soundtrack for inner peace",
    ],
    sunset: [
        "Golden hour magic ✨",
        "Chasing sunsets never gets old! Tonight's sky painted itself in the most incredible shades of orange, pink, and purple",
        "Perfect ending to a perfect day 🌅",
        "Stopped everything to watch this masterpiece unfold. Sometimes the most beautiful moments are completely unplanned",
        "Sky on fire tonight 🔥",
    ],
    mountains: [
        "Summit achieved! 🏔️",
        "Six hours of climbing and every step was worth it for this incredible panoramic view. The mountains teach you persistence",
        "Alpine adventures calling ⛰️",
        "Lost among the peaks and couldn't be happier. The silence up here is absolutely deafening in the best possible way",
        "Mountain therapy session complete 🥾",
    ],
    coffee: [
        "Morning fuel ☕",
        "Perfect brew to start another creative day. There's something magical about that first sip and the possibilities it brings",
        "Coffee shop vibes ✨",
        "Third cup today and no regrets! Sometimes you need that extra caffeine boost to tackle ambitious projects",
        "Bean there, done that ☕😄",
    ],
    food: [
        "Homemade happiness 🍝",
        "Spent hours in the kitchen experimenting with new flavors and techniques. The messy counters are always worth the delicious results",
        "Fresh from the garden 🥕",
        "Sunday cooking adventures led to this incredible feast! Nothing beats the satisfaction of creating something from scratch",
        "Foodie paradise discovered 🌮",
    ],
    city: [
        "Urban exploration day 🏙️",
        "The city never sleeps and neither do these incredible lights painting the skyline. Midnight walks hit differently",
        "Concrete jungle vibes ✨",
        "Found this amazing viewpoint after wandering through backstreets for hours. Cities have so many hidden perspectives",
        "Metropolitan magic 🌃",
    ],
    architecture: [
        "Geometric perfection 🏛️",
        "The intersection of old and new design tells such fascinating stories. This building has witnessed decades of change",
        "Lines and shadows 📐",
        "Architecture walk revealed incredible details I never noticed before. Sometimes you have to slow down to really see",
        "Built to last ⚡",
    ],
    winter: [
        "Winter wonderland discovered ❄️",
        "Fresh powder and crisp air make everything feel magical. The silence of snow-covered landscapes is absolutely peaceful",
        "Frozen in time ⛄",
        "Embracing the cold for these incredible ice formations. Winter creates art that no human hand could ever replicate",
        "Snow day bliss 🌨️",
    ],
    flowers: [
        "Bloom where you're planted 🌸",
        "Spring has officially arrived! These delicate petals survived the harsh winter to create this incredible display",
        "Garden goals achieved 🌺",
        "Hours of patient gardening finally paying off. Each bloom represents months of care, water, and hope",
        "Floral therapy session ✨",
    ],
    street: [
        "Street art discovery 🎨",
        "Urban canvas tells stories of creativity and rebellion. Found this incredible piece tucked away in the most unexpected place",
        "City streets have character 📸",
        "Every alley has secrets waiting to be discovered. Street photography reveals the soul of neighborhoods",
        "Concrete poetry 🖼️",
    ],
    workspace: [
        "Creative chaos organized ✨",
        "Late night productivity session fueled by good music and endless coffee. The creative flow hits different after midnight",
        "Desk setup complete 💻",
        "Sometimes the best ideas come when you're surrounded by the right tools and inspiration",
        "Grinding mode activated ⚡",
    ],
    art: [
        "Gallery opening tonight 🎨",
        "Local artists showcasing incredible talent and passion. Supporting creative communities feels more important than ever",
        "Masterpiece discovered 🖼️",
        "Art speaks where words fail. This piece has been haunting my thoughts since I first saw it",
        "Creative inspiration overload ✨",
    ],
    music: [
        "Live music hits different 🎵",
        "Intimate venue showcasing emerging talent tonight. The energy between artists and audience creates pure magic",
        "Concert vibes only 🎸",
        "Three hours of incredible performances and my ears are still ringing. Music truly is a universal language",
        "Sound therapy complete 🎤",
    ],
    books: [
        "Literary adventure awaits 📚",
        "Bookstore browsing turned into a three-hour treasure hunt. Found rare first editions and discovered new authors",
        "Reading nook perfection ✨",
        "Rainy afternoons call for good books, warm tea, and cozy corners exactly like this one",
        "Page turner discovered 📖",
    ],
    travel: [
        "Wanderlust satisfied 🗺️",
        "Road trip adventures leading to incredible discoveries. Sometimes the best destinations are completely unplanned",
        "Journey begins now ✈️",
        "Passport stamped and ready for the next adventure. Travel teaches you more than any classroom ever could",
        "Explorer mode activated 🎒",
    ],
    fitness: [
        "Morning workout complete 💪",
        "Sunrise yoga session with this incredible view. Starting the day with movement and gratitude sets everything right",
        "Training day dedication 🏃‍♂️",
        "Personal records broken and endorphins flowing. Sometimes pushing your limits reveals strength you never knew existed",
        "Gym life chosen ⚡",
    ],
};

const SAMPLE_LOCATIONS = [
    "Tokyo, Japan",
    "Paris, France",
    "New York, USA",
    "London, England",
    "Barcelona, Spain",
    "Sydney, Australia",
    "Berlin, Germany",
    "Amsterdam, Netherlands",
    "Rome, Italy",
    "Bangkok, Thailand",
    "Istanbul, Turkey",
    "Mumbai, India",
    "São Paulo, Brazil",
    "Cairo, Egypt",
    "Moscow, Russia",
    "Vancouver, Canada",
    "Seoul, South Korea",
    "Dubai, UAE",
    "Stockholm, Sweden",
    "Buenos Aires, Argentina",
    "Singapore",
    "Prague, Czech Republic",
    "Lisbon, Portugal",
    "Vienna, Austria",
    "Copenhagen, Denmark",
    "Athens, Greece",
    "Mexico City, Mexico",
    "Cape Town, South Africa",
    "Montreal, Canada",
    "Helsinki, Finland",
    "Zurich, Switzerland",
    "Oslo, Norway",
    "Dublin, Ireland",
    "Edinburgh, Scotland",
    "Warsaw, Poland",
    "Budapest, Hungary",
    "Reykjavik, Iceland",
    "Marrakech, Morocco",
    "Kyoto, Japan",
    "Florence, Italy",
    "Santorini, Greece",
    "Bali, Indonesia",
    "Queenstown, New Zealand",
    "Banff, Canada",
    "Patagonia, Chile",
    "Tulum, Mexico",
    "Petra, Jordan",
    "Machu Picchu, Peru",
    "Angkor Wat, Cambodia",
    "Serengeti, Tanzania",
    "Maldives",
    "Faroe Islands",
    "Lofoten Islands, Norway",
    "Scottish Highlands",
    "Tuscany, Italy",
    "Provence, France",
    "Napa Valley, USA",
    "Kerala, India",
    "Rajasthan, India",
    "Himalayan Foothills",
    null, // Some posts without location
];

// Unsplash collections for variety - expanded for more diversity
const UNSPLASH_COLLECTIONS = [
    "nature",
    "city",
    "food",
    "travel",
    "lifestyle",
    "architecture",
    "street-photography",
    "portrait",
    "landscape",
    "coffee",
    "sunset",
    "ocean",
    "mountains",
    "flowers",
    "technology",
    "art",
    "fashion",
    "minimalism",
    "vintage",
    "abstract",
    "urban",
    "night",
    "morning",
    "beach",
    "forest",
    "desert",
    "snow",
    "autumn",
    "spring",
    "summer",
    "winter",
    "garden",
    "park",
    "bridge",
    "building",
    "interior",
    "workspace",
    "library",
    "market",
    "restaurant",
    "cafe",
    "museum",
    "gallery",
    "concert",
    "festival",
    "sports",
    "fitness",
    "yoga",
    "meditation",
    "book",
    "music",
    "cooking",
    "baking",
    "wine",
    "beer",
    "cocktail",
    "tea",
    "breakfast",
    "lunch",
    "dinner",
    "street",
    "alley",
    "rooftop",
    "balcony",
    "window",
    "door",
    "stairs",
    "escalator",
    "subway",
    "train",
    "plane",
    "car",
    "bicycle",
    "boat",
    "harbor",
    "lighthouse",
    "castle",
    "church",
];

interface SeedUser {
    id: string;
    username: string;
}

interface UserPost {
    id: string;
    userId: string;
    imageUrl: string;
    caption: string | null;
    location: string | null;
    likesCount: number;
    sharesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface UnsplashImage {
    id: string;
    urls: {
        regular: string;
        small: string;
        thumb: string;
        full: string;
    };
    alt_description: string | null;
    description: string | null;
    user: {
        name: string;
        username: string;
    };
}

async function fetchImageFromUnsplash(category: string): Promise<{ blob: Blob; filename: string; imageData: UnsplashImage }> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        throw new Error("UNSPLASH_ACCESS_KEY environment variable is required");
    }

    // First, try to search for images in the category
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(category)}&per_page=30&orientation=square`;

    const searchResponse = await fetch(searchUrl, {
        headers: {
            'Authorization': `Client-ID ${accessKey}`,
        },
    });

    if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`Search failed for ${category}:`, searchResponse.status, errorText);

        // Try random photo as fallback
        const randomUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(category)}`;
        const randomResponse = await fetch(randomUrl, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`,
            },
        });

        if (!randomResponse.ok) {
            const randomErrorText = await randomResponse.text();
            throw new Error(`Failed to fetch random image for ${category}: ${randomResponse.status} - ${randomErrorText}`);
        }

        const randomImage: UnsplashImage = await randomResponse.json();
        const imageResponse = await fetch(randomImage.urls.regular);

        if (!imageResponse.ok) {
            throw new Error(`Failed to download random image: ${imageResponse.statusText}`);
        }

        const blob = await imageResponse.blob();
        const filename = `${category}-${randomImage.id}-${nanoid(8)}.jpg`;

        return { blob, filename, imageData: randomImage };
    }

    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
        throw new Error(`No images found for category: ${category}`);
    }

    // Pick a random image from results
    const randomImage: UnsplashImage = getRandomItem(searchData.results);

    // Download the image
    const imageUrl = randomImage.urls.regular;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const blob = await imageResponse.blob();
    const filename = `${category}-${randomImage.id}-${nanoid(8)}.jpg`;

    return { blob, filename, imageData: randomImage };
}

async function uploadImageFromUnsplash(category: string): Promise<string> {
    const { blob, filename, imageData } = await fetchImageFromUnsplash(category);

    // Convert blob to File
    const file = new File([blob], filename, { type: "image/jpeg" });

    // Generate presigned URL
    const { uploadUrl, publicUrl } = await generatePresignedUrl(
        filename,
        file.type,
        file.size,
    );

    // Upload to R2
    await uploadImageToR2(file, uploadUrl);

    console.log(`✓ Uploaded: ${filename} by ${imageData.user.name} (@${imageData.user.username})`);
    return publicUrl;
}

function generateRandomUsername(): string {
    return generate({ exactly: 2, join: "-" });
}

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(): Date {
    // Generate dates from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const randomTime =
        thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
    return new Date(randomTime);
}

async function createUserWithPosts(existingUsernames: Set<string>): Promise<{ user: SeedUser; posts: UserPost[] } | null> {
    // Generate unique username
    let username = generateRandomUsername();
    let attempts = 0;

    while (existingUsernames.has(username) && attempts < 10) {
        username = generateRandomUsername();
        attempts++;
    }

    if (existingUsernames.has(username)) {
        console.log("⚠️ Could not generate unique username after 10 attempts");
        return null;
    }

    const userId = nanoid();
    const numPosts = Math.floor(Math.random() * 5) + 1; // 1-5 posts
    const postData: UserPost[] = [];

    console.log(`\n👤 Preparing user: ${username} with ${numPosts} posts`);

    // STEP 1: Try to upload all images first (hold URLs temporarily)
    for (let i = 0; i < numPosts; i++) {
        try {
            const postId = nanoid();
            const randomCategory = getRandomItem(UNSPLASH_COLLECTIONS);
            const randomCaption = getRandomCaptionForCategory(randomCategory);
            const randomLocation = Math.random() > 0.3 ? getRandomItem(SAMPLE_LOCATIONS) : null;
            const randomLikes = Math.floor(Math.random() * 1000);
            const randomShares = Math.floor(Math.random() * 100);
            const randomDate = getRandomDate();

            console.log(`  📷 Post ${i + 1}/${numPosts}: Uploading ${randomCategory} image...`);

            // Upload image - if this fails, we skip this user entirely
            const imageUrl = await uploadImageFromUnsplash(randomCategory);

            // Hold the post data temporarily (don't create in DB yet)
            postData.push({
                id: postId,
                userId: userId,
                imageUrl: imageUrl,
                caption: randomCaption,
                location: randomLocation,
                likesCount: randomLikes,
                sharesCount: randomShares,
                createdAt: randomDate,
                updatedAt: randomDate,
            });

            console.log(`  ✓ Image ${i + 1}/${numPosts} uploaded successfully`);

            // Rate limiting - be respectful to Unsplash API
            await new Promise((resolve) => setTimeout(resolve, 4000));

        } catch (error) {
            console.error(`  ❌ Failed to upload image ${i + 1} for user ${username}:`, error);
            // If any image upload fails, we don't create this user at all
            return null;
        }
    }

    // STEP 2: Only if ALL images uploaded successfully, create user and posts in DB
    if (postData.length === numPosts) {
        try {
            console.log(`  💾 All images uploaded! Creating user ${username} in database...`);

            // Create user in database first
            await db.insert(users).values({
                id: userId,
                username: username,
                email: `${username.replace("-", "")}@example.com`,
            });

            console.log(`  ✓ User ${username} created in database`);

            // Now create all posts in database
            await db.insert(posts).values(postData);

            console.log(`  ✓ All ${numPosts} posts created in database for user ${username}`);

            // Add to existing usernames set
            existingUsernames.add(username);

            return {
                user: { id: userId, username },
                posts: postData
            };
        } catch (error) {
            console.error(`  ❌ Failed to create user ${username} or posts in database:`, error);
            return null;
        }
    }

    return null;
}

async function seedPosts() {
    console.log("🚀 Starting post seeding process...");

    // Check for required environment variables
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        throw new Error("UNSPLASH_ACCESS_KEY environment variable is required. Please set it in your .env file.");
    }

    const existingUsernames = new Set<string>();
    let totalPostsCreated = 0;
    let userCount = 0;

    // Continue until we have at least 100 posts
    while (totalPostsCreated < 100) {
        userCount++;
        console.log(`\n🎯 Target: ${100 - totalPostsCreated} more posts needed`);
        console.log(`👥 Processing user #${userCount}`);

        try {
            // Process ONE user at a time completely
            const result = await createUserWithPosts(existingUsernames);

            if (result) {
                totalPostsCreated += result.posts.length;

                console.log(`✅ User ${result.user.username} COMPLETED with ${result.posts.length} posts`);
                console.log(`📊 Total Progress: ${totalPostsCreated}/100 posts created`);

                // Move to next user only after this one is completely done
                console.log(`➡️ Moving to next user...`);
            } else {
                console.log(`⏭️ User failed, trying next user...`);
            }

        } catch (error) {
            console.error(`❌ Error with user #${userCount}:`, error);

            // Add longer delay on error to avoid rate limiting issues
            console.log("⏸️ Waiting 10 seconds before trying next user...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Final Stats:`);
    console.log(`   Users created: ${existingUsernames.size}`);
    console.log(`   Posts created: ${totalPostsCreated}`);
    console.log(`   Average posts per user: ${(totalPostsCreated / existingUsernames.size).toFixed(1)}`);
}

// Error handling wrapper
async function runSeed() {
    try {
        await seedPosts();
        process.exit(0);
    } catch (error) {
        console.error("💥 Seeding failed:", error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    runSeed();
}

export { seedPosts };