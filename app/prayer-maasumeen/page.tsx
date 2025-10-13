"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { saveQuote, addNote, addToHistory } from "@/lib/database";

interface Prayer {
  title: string;
  emoji: string;
  image: string;
  content: string;
  instructions: string[];
  total: string;
  benefits: string;
  supplication: string;
}

const PRAYERS: { [key: string]: Prayer } = {
  prophet: {
    title: "The Holy Prophet's (SAW) Prayer",
    emoji: "🌙",
    image: "/images/muhammad.jpg",
    content:
      "Sayyid Ibn Tawus, may Allah have mercy on him, has narrated, through an authenticated chain of authority, that when he was asked about Ja'far al-Tayyar's Prayer, Imam al-Rida (A.S.) said: Have you known about the Holy Prophet's Prayer? Perhaps, the Holy Prophet (S) had never offered Ja'far al-Tayyar's Prayer and Ja'far al-Tayyar had never offered the Holy Prophet's Prayer.",
    instructions: [
      "Offer a two-unit prayer reciting in each unit Surah al-Fatihah (No. 1) once and Surah al-Qadr (No. 97) fifteen times.",
      "When you come to the Ruku (genuflection), repeat it (Surah al-Qadr) fifteen times.",
      "When you raise your body after the Ruku, recite (Surah Qadr) fifteen times.",
      "When you do the Sujud (prostration), repeat (Surah al-Qadr) fifteen times.",
      "When you raise your head from the Sujud, repeat (Surah al-Qadr) fifteen times.",
      "When you do the second prostration, repeat (Surah al-Qadr) fifteen times.",
      "And when you raise your head from the second prostration, repeat (Surah al-Qadr) fifteen times.",
    ],
    total: "Total: 105 times Surah Al-Qadr",
    benefits:
      "When you finish your prayer, you will have all your sins forgiven by Almighty Allah and you will have all your requests granted for you.",
    supplication:
      "There is no god save Allah our Lord and the Lord of our fathers of old. There is no god save Allah one God, and to Him are we submissive. There is no god save Allah we worship none save Him making our devotion sincere as in His sight even though the polytheists may detest it. There is no god save Allah alone, alone, alone He has truly fulfilled His promise granted His servant victory made powerful His soldiers and defeated the parties alone. All sovereignty be His and all praise be to Him And He has power over all things. O Allah, You are the Light of the heavens and the earth and whatever is in these two So, all praise be to You And You are the Fashioner of the heavens and the earth and whatever exists in these two So, all praise be to You You are the (utter) Truth Your promise is utterly true Your word is true Your fulfillment is true Paradise is true and Hellfire is true O Allah, to You have I surrendered in You do I believe on You do I rely for Your sake do I dispute and Your judgment do I seek O my Lord; O my Lord; O my Lord please forgive me my past and next sins and my hidden and open ones You are verily my God; there is no god save You Send blessings upon Muhammad and the Household of Muhammad forgive me have mercy on me and accept my repentance Verily, You are the Oft-Returning, the Most Merciful.",
  },
  fatimah: {
    title: "Lady Fatimah al-Zahra's (SA) Prayer",
    emoji: "⭐",
    image: "/images/fatimah.jpg",
    content:
      "It is narrated that Lady Fatimah al-Zahra', peace be upon her, used to offer a two-unit prayer taught by Archangel Gabriel. This prayer has three versions, each with its own unique method and supplication.",
    instructions: [
      "First Version: First unit: Surah al-Fatihah once + Surah al-Qadr 100 times. Second unit: Surah al-Fatihah once + Surah al-Tawhid once. After Taslim, recite the litany.",
      "Second Version: First unit: Surah al-Fatihah once + Surah al-Qadr 100 times. Second unit: Surah al-Fatihah once + Surah al-Tawhid 100 times. After Taslim, say Tasbih al-Zahra', then prostrate and recite the supplication.",
      "Third Version (Friday Special): Perform Ghusl. Offer 4 units (two at a time): Unit 1: Fatihah + Tawhid 50 times. Unit 2: Fatihah + Adiyat 50 times. Unit 3: Fatihah + Zalzalah 50 times. Unit 4: Fatihah + Nasr 50 times.",
    ],
    total: "Three prayer versions available",
    benefits:
      "Sayyid Ibn Tawus adds that it is better to say the famous Tasbih al-Zahra' after offering this prayer and then invoke Almighty Allah's blessings upon the Holy Prophet and his Household.",
    supplication:
      "First Version Litany: Glory be to the Lord of Honor and Sublime Authority. Glory be to the Lord of Majesty and Exalted Greatness. Glory be to the Lord of eternal, splendid sovereignty. Glory be to Him Who dressed Himself with splendor and beauty. Glory be to Him Who is clad in light and dignity. Glory be to Him Who makes out the footprints of the ant on the stone. Glory be to Him Who knows (the exact time and place of) the bird dipping down through the air. Glory be to Him Who is like this and no one (other than Him) is like this.\n\nSecond Version (While Prostrating): O He besides Whom there is no lord to be supplicated! O He above Whom there is no god to be feared! O He except Whom there is no master to be revered! O He Who has no counselor to be approached! O He Who has no attendant to be bribed! O He Who has no doorkeeper to be visited (secretly)! O He Who gives not but generously and liberally no matter how many the demands are and deals not with numerous sins but mercifully and kindly! Send blessings upon Muhammad and his Household… [Then mention your personal requests]\n\nThird Version (Friday Prayer): O My God and Master, whilst one prepares oneself, sets up, arranges, or gets ready for visiting a mortal in the hope of attaining a gift, interests, a souvenir, bequests, or presents from him, to You, O my God, have I prepared myself, set up, arranged and got ready in the hope of attaining Your interests, favors, souvenirs, and presents. Hence, (please) do not disappoint me of all these. O You with Whom no asker is disappointed and no present of an earner causes You reduction...",
  },
  ali: {
    title: "Imam Ali's (AS) Prayer",
    emoji: "🦁",
    image: "/images/ali.jpg",
    content:
      "Shaykh al-Tusi and Sayyid Ibn Tawus have recorded that Imam Ja'far al-Sadiq said: One who offers the four-unit prayer of Imam Ali Amir al-Mu'minin will be as free of sins as newborns and will have all his requests granted.",
    instructions: [
      "Offer a four-unit prayer",
      "In the first unit: Recite Surah al-Fatihah once and Surah al-Tawhid fifty times",
      "After completion, recite the litany",
      "Then recite the main supplication",
    ],
    total: "50 times Surah al-Tawhid in first unit",
    benefits:
      "One who offers this prayer and says this supplication will have all his sins forgiven. Numerous narrations mention splendid reward for those who offer this prayer on Fridays. One who says the additional supplicatory prayer will have all previous and coming sins forgiven, will be given the reward of reciting the holy Qur'an entirely twelve times, and will be saved from thirst on the Resurrection Day.",
    supplication:
      "Litany: Glory be to Him Whose signs never perish. Glory be to Him Whose reserves never downgrade. Glory be to Him Whose honor never vanishes. Glory be to Him Whose possessions never run out. Glory be to Him Whose duration (of existence) is never interrupted. Glory be to Him Who never betakes to Himself a partner in His affairs. Glory be to Him save Whom there is no god.\n\nMain Supplication: O He who overlooks sins and does not inflict punishment in return, (please) have mercy on Your servant, O Allah, that is I myself, that is I myself. I am Your servant, O my Chief, I am Your servant; I am at Your disposal; O my Lord. O my God, in the name of Your Being, O my Hope, O my All-beneficent, O my Supporter, Your servant, Your servant, has no strategy...",
  },
  hasan: {
    title: "Imam al-Hasan's (AS) Prayer",
    emoji: "🌟",
    image: "/images/hasan.jpg",
    content:
      "This prayer consists of four units, recommended to be offered on Fridays. It is a blessed prayer taught by Imam al-Hasan, peace be upon him.",
    instructions: [
      "Offer a four-unit prayer",
      "In each unit: Recite Surah al-Fatihah once and Surah al-Tawhid twenty-five times",
      "After completion, recite the supplication below",
    ],
    total: "100 times Surah al-Tawhid (25 times per unit × 4 units)",
    benefits:
      "This prayer brings nearness to Allah through His magnanimity and the intercession of the Holy Prophet and his Household. It is a means of seeking forgiveness and having one's needs fulfilled.",
    supplication:
      "O Allah, I seek nearness to You in the name of Your magnanimity and nobility. I seek nearness to You in the name of Muhammad, Your servant and messenger. I seek nearness to You in the name of Your Favorite Angels and Your prophets and messengers, [and I beseech You] to send blessings to Muhammad, Your servant and messenger, and upon the Household of Muhammad, overlook my slips, cover my sins, forgive them for me, settle all my needs, and not to punish me for the evildoings that I have committed. Verily, Your pardon and magnanimity include me. Verily, You have power over all things.",
  },
  hussain: {
    title: "Imam al-Husayn's (AS) Prayer",
    emoji: "💚",
    image: "/images/hussain.jpg",
    content:
      "This is a comprehensive prayer taught by Imam al-Husayn, peace be upon him, consisting of four units with extensive recitation in each position of the prayer.",
    instructions: [
      "Offer a four-unit prayer",
      "In each unit (standing): Recite Surah al-Fatihah and Surah al-Tawhid 25 times",
      "While in Ruku: Recite Surah al-Fatihah and Surah al-Tawhid 10 times",
      "After Ruku: Recite Surah al-Fatihah and Surah al-Tawhid 10 times",
      "First Sujud: Recite Surah al-Fatihah and Surah al-Tawhid 10 times",
      "Between Sujuds: Recite Surah al-Fatihah and Surah al-Tawhid 10 times",
      "Second Sujud: Recite Surah al-Fatihah and Surah al-Tawhid 10 times",
    ],
    total: "75 times per unit × 4 units = 300 recitations total",
    benefits:
      "This prayer brings immense spiritual reward and divine response. It combines intensive recitation with heartfelt supplication, making it a powerful means of seeking Allah's mercy and having one's prayers answered.",
    supplication:
      "O Allah, it is You who responded to Adam and Eve, responded to Prophet Noah, responded to Prophet Abraham, responded to Prophet Moses, and responded to all Your prophets and messengers. I beseech You by the same means through which they besought You, and by the right of Muhammad and his Household, to respond to my prayers, settle my needs, and grant me relief from my difficulties. Verily, You have power over all things.",
  },
  zayn: {
    title: "Imam Zayn al-Abidin's (AS) Prayer",
    emoji: "📿",
    image: "/images/zayn_al_abidin.jpg",
    content:
      "This is a blessed prayer taught by Imam Zayn al-Abidin (also known as Imam Ali ibn Husayn), peace be upon him. It is known for its powerful supplication that emphasizes Allah's mercy and forgiveness.",
    instructions: [
      "Offer a four-unit prayer",
      "In each unit: Recite Surah al-Fatihah once and Surah al-Tawhid one hundred times",
      "After completion, recite the supplication below",
    ],
    total: "400 times Surah al-Tawhid (100 times per unit × 4 units)",
    benefits:
      "This prayer is a powerful means of seeking Allah's mercy, forgiveness, and concealment of our sins. It acknowledges Allah's generosity in bestowing blessings even before we deserve them, and brings immense spiritual reward to those who perform it with sincerity.",
    supplication:
      "O He Who has shown only goodness and concealed the evil (deeds of His servants)! O He Who has not censured for the offenses and has not exposed the hidden! O He Who is Ample in pardoning! O He Who is Excellent in overlooking! O He Who is Liberal in forgiving! O He Who opens His hands wide with mercy! O He Who is present in all confidential talks! O He Who is the ultimate objective of all complaints! O He Who is Generous in condonation! O He Who is greatly hoped! O He Who takes the initiative in favoring before they are deserved! O our Lord, our Master, and our Chief! O He Who is the ultimate of our desires! I beseech You, O Allah, to send blessings to Muhammad and the Household of Muhammad.",
  },
  baqir: {
    title: "Imam al-Baqir's (AS) Prayer",
    emoji: "📖",
    image: "/images/baqir.jpg",
    content:
      "This is a blessed prayer taught by Imam Muhammad al-Baqir, peace be upon him. It consists of two units with a beautiful litany of praise and glorification of Allah.",
    instructions: [
      "Offer a two-unit prayer",
      "In each unit: Recite Surah al-Fatihah once",
      "Then repeat the litany one hundred times: All glory be to Allah (Subhan Allah), All praise be to Allah (Alhamdulillah), There is no god save Allah (La ilaha illa Allah), Allah is the Greatest (Allahu Akbar)",
      "After completion, recite the supplication",
    ],
    total: "200 repetitions of the litany (100 times per unit × 2 units)",
    benefits:
      "This prayer emphasizes Allah's attributes of mercy, forgiveness, and love. It is a humble supplication asking Allah to treat us according to His generosity rather than what we deserve, acknowledging that all good comes from Him alone.",
    supplication:
      "O Allah, I beseech You, O Indulgent, Forbearing, Forgiving, and Loving-kind, to overlook my sins and what I have had, out of the excellence of what You have, to give me, out of Your giving, that which suffices me, to inspire me to act upon what You have given me; that is to obey You and to obey Your Messenger, and to give me part of Your pardon so much so that I ought to have Your honoring. O Allah, (please) grant me that which befits You and do not do to me that which I deserve. Verily, I exist through You and I have never been given any good thing from any source except You. O He Who is the best Seer of all those who can see! O He Who is the best Hearer of all those who can hear! O He Who is the Justest of all those who judge! O He Who aids those who seek His aid! O He Who responds to the prayer of the oppressed! Send blessings upon Muhammad and the Household of Muhammad.",
  },
  sadiq: {
    title: "Imam al-Sadiq's (AS) Prayer",
    emoji: "✨",
    image: "/images/sadiq.jpg",
    content:
      "This is a blessed prayer taught by Imam Ja'far al-Sadiq, peace be upon him. It includes the recitation of Ayat al-Tashahhud, which are powerful verses from Surah Al-Imran affirming the Oneness of Allah and His justice.",
    instructions: [
      "Offer a two-unit prayer",
      "In each unit: Recite Surah al-Fatihah once",
      "Then recite Ayat al-Tashahhud (Verses 3:18-19) one hundred times",
      "The verses: 'Allah bears witness that there is no deity except Him, and [so do] the angels and those of knowledge - [that He is] maintaining [creation] in justice. There is no deity except Him, the Exalted in Might, the Wise. Indeed, the religion in the sight of Allah is Islam...'",
      "After completion, recite the supplication",
    ],
    total:
      "200 recitations of Ayat al-Tashahhud (100 times per unit × 2 units)",
    benefits:
      "This prayer emphasizes Allah's omnipresence, omniscience, and eternal existence. It is a powerful means of seeking Allah's witness over our devotion and acknowledging His constant awareness of all matters, both hidden and manifest.",
    supplication:
      "O He Who Makes all made things! O He Who splints all broken bones! O He Who is present in all assemblages! O He Who is the Witness of all confidential talks! O He Who knows all hidden matters! O He Who is always present and is never absent! O He Who is always triumphant and is never defeated! O He Who is always nigh and is never remote! O He Who entertains all lonely ones! O He Who is ever-living, raiser of the dead, and causing the alive to die! O He Who watches every soul as to what it earns! O He Who was living when there was nothing existent! There is no god save You! (please) send blessings to Muhammad and the Household of Muhammad.",
  },
  kadhim: {
    title: "Imam al-Kadhim's (AS) Prayer",
    emoji: "🌙",
    image: "/images/kadhim.jpg",
    content:
      "This is a blessed prayer taught by Imam Musa al-Kadhim, peace be upon him. It is known for its profound supplication that describes Allah's majesty, beauty, and omnipotence in eloquent terms.",
    instructions: [
      "Offer a two-unit prayer",
      "In each unit: Recite Surah al-Fatihah once and Surah al-Tawhid twelve times",
      "After completion, recite the supplication below",
    ],
    total: "24 recitations of Surah al-Tawhid (12 times per unit × 2 units)",
    benefits:
      "This prayer beautifully expresses Allah's transcendence while acknowledging His nearness to His servants. It is a means of seeking relief from difficulties and having one's needs fulfilled through sincere devotion and acknowledgment of Allah's infinite greatness.",
    supplication:
      "O my God, all sounds are submissive to You, all intellects are too short to recognize You [as exactly as You are], all things are fearful of You, all things flee to You, all things are too tiny in comparison with You, and Your light fills all things. Therefore, You are the Exalted in Your majesty, You are the Luminous in Your splendor, You are the Great in Your omnipotence, and You are Whom nothing can tire. O He Who sends down my bounties! O He Who relieves my agonies! O He Who settles my needs! (please) Give answer to my request, in the name of 'There is no god save You'. I believe in You and I am sincere to You in obedience. I begin my day keeping my covenant and promise to You as much as I can. I confess of Your favor to me and I beseech You to forgive my sins that none else can forgive. O He Who is nigh in His sublimity, Sublime in His nearness, Brilliant in His glow, and Powerful in His [absolute] authority! (please) Send blessings upon Muhammad and his Household.",
  },
  rida: {
    title: "Imam al-Rida's (AS) Prayer",
    emoji: "⭐",
    image: "/images/rida.jpg",
    content:
      "This is a blessed prayer taught by Imam Ali al-Rida, peace be upon him. It consists of six units, making it one of the longer prayers among the Imams' special prayers. It includes the recitation of Surah al-Insan (also known as Surah al-Dahr), which speaks of the rewards of the righteous.",
    instructions: [
      "Offer a six-unit prayer (can be prayed as three sets of two units each)",
      "In each unit: Recite Surah al-Fatihah once and Surah al-Insan (No. 76) ten times",
      "After completion, recite the supplication below",
    ],
    total: "60 recitations of Surah al-Insan (10 times per unit × 6 units)",
    benefits:
      "This prayer acknowledges Allah as our constant companion in both times of difficulty and prosperity. It invokes Allah through the sacred letters of the Qur'an and the legacy of the prophets, seeking His unmatched generosity and favor. The extensive recitation of Surah al-Insan brings immense spiritual reward.",
    supplication:
      "O My Companion in my distress! O My Patron in my bounties! O My God and the God of Abraham, Ishmael, Isaac, and Jacob! O Lord of kaf-ha'-ya'-'ayn-sad, ya'-sin, and the Qur'an full of wisdom! I beseech You—O Most Excellent of all those who may be besought! O Most Favorite of all those who may be prayed! O Most Magnanimous of all those who may give! O Most Preferred of all those who may be hoped! I beseech You to send blessings to Muhammad and the Household of Muhammad.",
  },
  jawad: {
    title: "Imam al-Jawad's (AS) Prayer",
    emoji: "💎",
    image: "/images/jawad.jpg",
    content:
      "This is a blessed prayer taught by Imam Muhammad al-Jawad (also known as Imam al-Taqi), peace be upon him. It features a profound supplication that speaks of the Day of Resurrection and the return of souls to their bodies.",
    instructions: [
      "Offer a two-unit prayer",
      "In each unit: Recite Surah al-Fatihah once and Surah al-Tawhid seventy times",
      "After completion, recite the supplication below",
    ],
    total: "140 recitations of Surah al-Tawhid (70 times per unit × 2 units)",
    benefits:
      "This prayer invokes Allah through the reality of resurrection and the Day of Judgment, seeking spiritual enlightenment, strong faith, constant remembrance of Allah, and the ability to perform righteous deeds. It reminds us of the accountability that awaits us in the Hereafter.",
    supplication:
      "O Allah, Lord of the souls passing away and the rotten corpses! I beseech You in the name of the obedience of the souls that are restored to their bodies and the obedience of the corpses that join their veins and in the name of Your Word that is effective on them and in the name of Your judging justly among them; while the [other] creatures are standing before You awaiting the decisions of Your judgment, hoping for Your mercy, and fearing Your punishment; (please do) send blessings to Muhammad and the Household of Muhammad, place light in my sight, strong belief in my heart, and reference to You night and day on my tongue, and provide me with a righteous deed.",
  },
  hadi: {
    title: "Imam al-Hadi's (AS) Prayer",
    emoji: "🌟",
    image: "/images/hadi.jpg",
    content:
      "This is a blessed prayer taught by Imam Ali al-Hadi (also known as Imam al-Naqi), peace be upon him. It features the recitation of two of the most beautiful and spiritually powerful Surahs: Yasin and al-Rahman.",
    instructions: [
      "Offer a two-unit prayer",
      "First unit: Recite Surah al-Fatihah once and Surah Yasin (No. 36) once",
      "Second unit: Recite Surah al-Fatihah once and Surah al-Rahman (No. 55) once",
      "After completion, recite the supplication below",
    ],
    total: "Surah Yasin once + Surah al-Rahman once",
    benefits:
      "This prayer invokes Allah through His most sacred and hidden names. The recitation of Surah Yasin (known as the heart of the Qur'an) and Surah al-Rahman (the chapter of divine mercy) brings immense spiritual blessings. This prayer emphasizes Allah's transcendent nature and His beautiful attributes.",
    supplication:
      "O Foremost Beneficent! O Object of Love! O He Who is the Witness of all unseen things! O He Who is Nigh without being away (from any other thing)! O He Who (always) prevails (but) is never overpowered! O He Whom no one knows how He is except He! O He Whose authority no one can challenge! I beseech You, O Allah, in Your name: the Well-Guarded, the Treasured, the Concealed from whom You will, the Pure, the Purified, the Holy, the utter Light, the Ever-living, the Everlasting, the Greatest, the Light of the heavens and the Light of the [layers of] the earth, the Knower of the unseen and the seen, the Highest, the Sublime, the Glorious! Send blessings upon Muhammad and the Household of Muhammad.",
  },
  askari: {
    title: "Imam al-Askari's (AS) Prayer",
    emoji: "📿",
    image: "/images/askari.jpg",
    content:
      "This is a blessed prayer taught by Imam Hasan al-Askari, peace be upon him. It consists of four units with a profound supplication that invokes Allah through His divine attributes and names.",
    instructions: [
      "Offer a four-unit prayer",
      "First two units: In each, recite Surah al-Fatihah once and Surah al-Zalzalah (No. 99) fifteen times",
      "Last two units: In each, recite Surah al-Fatihah once and Surah al-Tawhid fifteen times",
      "After completion, recite the supplication below",
    ],
    total: "Surah al-Zalzalah 30 times + Surah al-Tawhid 30 times",
    benefits:
      "This prayer is a comprehensive invocation of Allah's divine names and attributes. It affirms His absolute oneness, His knowledge of all things, and His sovereignty over creation. The recitation brings spiritual enlightenment and is a means of seeking Allah's mercy and blessings.",
    supplication:
      "O Allah, I beseech You in the name of all praise being to You; there is no god save You, [You are] the Premier before all things; and You are the Ever-living, the Self-Subsistent; and there is no god save You, nothing can humiliate You; and You, every moment, are in a state (of glory). There is no god save You, the Creator of what is seen and what cannot be seen, the Knower of all things without learning; I beseech You in the name of Your bounties and gratuities and in the name of Your being Allah, the One Lord, there is no god save You, the All-beneficent, the All-merciful...",
  },
  mahdi: {
    title: "Imam al-Mahdi's (AJTFS) Prayer",
    emoji: "🌙",
    image: "/images/mahdi.jpg",
    content:
      "This is a blessed prayer attributed to Imam al-Mahdi, may Allah hasten his reappearance. It features the repeated recitation of a verse from Surah al-Fatihah that expresses pure devotion and reliance on Allah, followed by a heartfelt supplication calling for the relief and reappearance of the Awaited Imam.",
    instructions: [
      "Offer a two-unit prayer",
      "In each unit: Recite Surah al-Fatihah once",
      "Then repeat the verse 'You do we worship, and Yours aid we seek' (Iyyaka na'budu wa iyyaka nasta'in) one hundred times",
      "Then recite Surah al-Tawhid once",
      "After completion, recite the supplication",
    ],
    total: "200 repetitions of the verse (100 times per unit × 2 units)",
    benefits:
      "This prayer is a powerful plea for the hastening of Imam al-Mahdi's reappearance and relief from the tribulations of the world. It acknowledges our complete dependence on Allah and seeks intercession through the Holy Prophet and Imam Ali. Reciting this prayer demonstrates loyalty to the Imam of our time and strengthens our connection with him during his occultation.",
    supplication:
      "O Allah, unbearable is our tribulation! The hidden has been disclosed! The cover has been exposed! The earth has become too narrow to carry that which could be embraced by the sky. To You, my Lord, is the complaint and in You is the trust in sorrow and in joy. O Allah, send blessings to Muhammad and the Household of Muhammad whom You have commanded us to obey, and hasten their Relief through the Rising Imam among them; and make manifest Your fortifying him. O Muhammad! O Ali! O Ali! O Muhammad! Save me, for you both are true saviors of me. O Muhammad! O Ali! O Ali! O Muhammad! Aid me, for you both are true aides of me. O Muhammad! O Ali! O Ali! O Muhammad! Protect me, for you both are true protectors of me. O my master, the Patron of the Age! O my master, the Patron of the Age! O my master, the Patron of the Age! Help, help, help! [come to] succor me, [come to] succor me, [come to] succor me! [grant me] security, [grant me] security, [grant me] security!",
  },
};

export default function PrayerMasumeenPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSavePrayer = async (
    title: string,
    content: string,
    supplication: string
  ) => {
    if (!user) {
      alert("Please login to save prayers!");
      router.push("/login");
      return;
    }

    const fullContent = `${content}\n\nSupplication:\n${supplication}`;

    try {
      const { saveQuote } = await import("@/lib/database");
      const result = await saveQuote(user.username, title, fullContent);
      if (result.success) {
        alert("Prayer saved successfully!");
      } else {
        alert(result.message || "Prayer already saved");
      }
    } catch (error) {
      console.error("Error saving prayer:", error);
    }
  };

  const handleAddNote = async (title: string) => {
    if (!user) {
      alert("Please login to add notes!");
      router.push("/login");
      return;
    }

    if (!noteText.trim()) {
      alert("Please enter a note!");
      return;
    }

    try {
      await addNote(user.username, title, noteText);
      alert("Note saved!");
      setAddingNoteFor(null);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handlePrayerView = async (title: string) => {
    if (user) {
      await addToHistory(user.username, title);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        padding: "20px",
      }}
    >
      <Particles />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>

          {user && (
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 216, 155, 0.2)",
                border: "1px solid rgba(255, 216, 155, 0.4)",
                borderRadius: "10px",
                color: "#ffd89b",
                cursor: "pointer",
              }}
            >
              📊 Dashboard
            </button>
          )}
        </div>

        {/* Page Title */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 20px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.8rem",
              fontWeight: "900",
              marginBottom: "5px",
              letterSpacing: "2px",
              color: "white",
              textShadow:
                "0 0 20px rgba(255, 216, 155, 0.6), 0 0 40px rgba(255, 216, 155, 0.4)",
            }}
          >
            🕌 Salat of Ahlulbayt (A.S.)
          </h1>
          <p style={{ fontSize: "1rem", color: "#b0b0b0", fontWeight: "300" }}>
            Prayers of the Fourteen Infallibles
          </p>
        </div>

        {/* Introduction */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
            borderRadius: "15px",
            border: "2px solid rgba(255, 216, 155, 0.3)",
            padding: "30px",
            marginBottom: "40px",
            color: "#f5f5f5",
            lineHeight: "1.9",
            textAlign: "justify",
          }}
        >
          <p style={{ margin: 0 }}>
            Salaat of Masoomeen - Prayers on Fridays. Excluding the Friday
            Supererogatory Prayer (Nafilat al-Jumu'ah), many other optional
            prayers are reported to be offered on Fridays. Although the majority
            of these prayers are not dedicated to Fridays, it is highly
            recommended to offer them on Fridays.
          </p>
        </div>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 216, 155, 0.5), transparent)",
            margin: "40px 0",
          }}
        />

        {/* Prayers List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Object.entries(PRAYERS).map(([key, prayer]) => {
            const isExpanded = expandedPrayer === key;

            return (
              <div
                key={key}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  onClick={() => {
                    const newExpanded = isExpanded ? null : key;
                    setExpandedPrayer(newExpanded);
                    if (newExpanded) {
                      handlePrayerView(prayer.title);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "20px",
                    background: "transparent",
                    border: "none",
                    color: "white",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    {prayer.emoji} {prayer.title}
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: "0 20px 20px 20px" }}>
                    {/* Image */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ maxWidth: "400px", width: "100%" }}>
                        <img
                          src={prayer.image}
                          alt={prayer.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "15px",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(25, 84, 123, 0.3) 0%, rgba(255, 216, 155, 0.2) 100%)",
                        borderRadius: "15px",
                        border: "2px solid rgba(255, 216, 155, 0.4)",
                        padding: "25px",
                        marginBottom: "20px",
                        color: "#ffffff",
                        fontFamily: "'Georgia', serif",
                        fontSize: "17px",
                        lineHeight: "1.8",
                        borderLeft: "5px solid #ffd89b",
                      }}
                    >
                      {prayer.content}
                    </div>

                    {/* Instructions */}
                    <h3
                      style={{
                        color: "#ffd89b",
                        fontSize: "1.4rem",
                        marginTop: "40px",
                        marginBottom: "20px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      📋 How to Perform This Prayer
                    </h3>

                    {prayer.instructions.map((instruction, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(255, 216, 155, 0.1)",
                          border: "1px solid rgba(255, 216, 155, 0.3)",
                          borderRadius: "10px",
                          padding: "20px",
                          margin: "15px 0",
                          color: "#e0e0e0",
                          fontFamily: "'Georgia', serif",
                          fontSize: "16px",
                          lineHeight: "1.7",
                        }}
                      >
                        <strong>{idx + 1}.</strong> {instruction}
                      </div>
                    ))}

                    {/* Total */}
                    {prayer.total && (
                      <div
                        style={{
                          textAlign: "center",
                          margin: "30px 0",
                          padding: "20px",
                          background: "rgba(255, 216, 155, 0.1)",
                          borderRadius: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "#ffd89b",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            margin: 0,
                          }}
                        >
                          {prayer.total}
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                        margin: "30px 0",
                      }}
                    />

                    {/* Benefits */}
                    {prayer.benefits && (
                      <>
                        <h3
                          style={{
                            color: "#ffd89b",
                            fontSize: "1.4rem",
                            marginTop: "40px",
                            marginBottom: "20px",
                            textAlign: "center",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          ✨ Benefits of Performing This Prayer
                        </h3>

                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(25, 84, 123, 0.3) 0%, rgba(255, 216, 155, 0.2) 100%)",
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 216, 155, 0.4)",
                            padding: "25px",
                            marginBottom: "20px",
                            color: "#ffffff",
                            fontFamily: "'Georgia', serif",
                            fontSize: "17px",
                            lineHeight: "1.8",
                            borderLeft: "5px solid #ffd89b",
                          }}
                        >
                          {prayer.benefits}
                        </div>

                        <div
                          style={{
                            height: "1px",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                            margin: "30px 0",
                          }}
                        />
                      </>
                    )}

                    {/* Supplication */}
                    <h3
                      style={{
                        color: "#ffd89b",
                        fontSize: "1.4rem",
                        marginTop: "40px",
                        marginBottom: "20px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      🤲 The Supplication
                    </h3>

                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(24, 40, 72, 0.9) 100%)",
                        borderRadius: "15px",
                        border: "2px solid rgba(255, 216, 155, 0.3)",
                        padding: "30px",
                        color: "#f5f5f5",
                        fontFamily: "'Georgia', serif",
                        fontSize: "17px",
                        lineHeight: "2.2",
                        textAlign: "justify",
                        marginBottom: "20px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {prayer.supplication}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginTop: "20px",
                      }}
                    >
                      {user && (
                        <>
                          <button
                            onClick={() =>
                              handleSavePrayer(
                                prayer.title,
                                prayer.content,
                                prayer.supplication
                              )
                            }
                            style={{
                              padding: "10px 20px",
                              background: "rgba(255, 216, 155, 0.2)",
                              border: "1px solid rgba(255, 216, 155, 0.4)",
                              borderRadius: "10px",
                              color: "#ffd89b",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            💾 Save Prayer
                          </button>

                          <button
                            onClick={() => setAddingNoteFor(prayer.title)}
                            style={{
                              padding: "10px 20px",
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "10px",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            📝 Add Note
                          </button>
                        </>
                      )}

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${prayer.content}\n\n${prayer.supplication}`
                          )
                        }
                        style={{
                          padding: "10px 20px",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "10px",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>

                    {/* Add Note Form */}
                    {addingNoteFor === prayer.title && (
                      <div style={{ marginTop: "20px" }}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Your reflection on this prayer..."
                          style={{
                            width: "100%",
                            padding: "15px",
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "10px",
                            color: "white",
                            fontSize: "15px",
                            minHeight: "100px",
                            marginBottom: "10px",
                            fontFamily: "inherit",
                          }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleAddNote(prayer.title)}
                            style={{
                              padding: "10px 20px",
                              background:
                                "linear-gradient(135deg, #19547b, #ffd89b)",
                              border: "none",
                              borderRadius: "10px",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => {
                              setAddingNoteFor(null);
                              setNoteText("");
                            }}
                            style={{
                              padding: "10px 20px",
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "10px",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            color: "#888",
            fontSize: "0.9rem",
            padding: "20px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p style={{ marginBottom: "5px" }}>
            © 2025{" "}
            <span style={{ color: "#ffd89b", fontWeight: "600" }}>ULAMA</span> |
            All rights reserved
          </p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            May our prayers be accepted
          </p>
        </div>
      </div>
    </div>
  );
}
