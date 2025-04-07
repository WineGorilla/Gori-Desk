document.addEventListener("DOMContentLoaded", async () => {
  const birthdayInput = document.getElementById("pet-birthday");
  const zodiacInput = document.getElementById("pet-zodiac");

  // 获取当前语言设置
  const settings = await window.settingAPI.getSettings();
  const lang = settings.language || "zh";

  // 加载界面语言
  updateLanguageUI(lang);

  // 加载数据库信息
  const data = await window.profileAPI.loadProfile();
  document.getElementById("owner-name").value = data.owner_name || "";
  document.getElementById("owner-gender").value = data.owner_gender || "";
  document.getElementById("owner-birthday").value = data.owner_birthday || "";
  document.getElementById("pet-name").value = data.pet_name || "";
  document.getElementById("pet-birthday").value = data.pet_birthday || "";
  document.getElementById("pet-zodiac").value = data.pet_zodiac || "";

  // 加载时同步星座
  if (data.pet_birthday) {
    const date = new Date(data.pet_birthday);
    zodiacInput.value = getZodiacSign(date.getMonth() + 1, date.getDate(), lang);
  }

  // 宠物生日变动 => 实时更新星座
  birthdayInput.addEventListener("change", () => {
    const date = new Date(birthdayInput.value);
    zodiacInput.value = getZodiacSign(date.getMonth() + 1, date.getDate(), lang);
  });

  // 保存按钮
  document.getElementById("saveBtn").addEventListener("click", () => {
    const info = {
      ownerName: document.getElementById("owner-name").value,
      ownerGender: document.getElementById("owner-gender").value,
      ownerBirthday: document.getElementById("owner-birthday").value,
      petName: document.getElementById("pet-name").value,
      petBirthday: document.getElementById("pet-birthday").value,
      petZodiac: document.getElementById("pet-zodiac").value
    };

    window.profileAPI.saveProfile(info);
    alert(lang === "zh" ? "保存成功！" : "Saved successfully!");
  });

  // 多语言文本更新函数
  function updateLanguageUI(lang) {
    const i18n = {
      zh: {
        titleOwner: "主人的信息",
        labelOwnerName: "姓名",
        labelOwnerGender: "性别",
        labelOwnerBirthday: "生日",
        titlePet: "宠物信息",
        labelPetName: "名字",
        labelPetBirthday: "生日",
        labelPetZodiac: "星座",
        save: "保存",
        genderOptions: ["请选择", "男", "女"]
      },
      en: {
        titleOwner: "Owner Info",
        labelOwnerName: "Name",
        labelOwnerGender: "Gender",
        labelOwnerBirthday: "Birthday",
        titlePet: "Pet Info",
        labelPetName: "Name",
        labelPetBirthday: "Birthday",
        labelPetZodiac: "Zodiac Sign",
        save: "Save",
        genderOptions: ["Select", "Male", "Female"]
      }
    };

    const t = i18n[lang] || i18n.zh;
    document.getElementById("title-owner").textContent = t.titleOwner;
    document.getElementById("label-owner-name").textContent = t.labelOwnerName;
    document.getElementById("label-owner-gender").textContent = t.labelOwnerGender;
    document.getElementById("label-owner-birthday").textContent = t.labelOwnerBirthday;
    document.getElementById("title-pet").textContent = t.titlePet;
    document.getElementById("label-pet-name").textContent = t.labelPetName;
    document.getElementById("label-pet-birthday").textContent = t.labelPetBirthday;
    document.getElementById("label-pet-zodiac").textContent = t.labelPetZodiac;
    document.getElementById("saveBtn").textContent = t.save;

    // 性别选项
    const genderSelect = document.getElementById("owner-gender");
    genderSelect.options[0].text = t.genderOptions[0];
    genderSelect.options[1].text = t.genderOptions[1];
    genderSelect.options[2].text = t.genderOptions[2];
  }

  // 星座计算（中英文）
  function getZodiacSign(month, day, lang = "zh") {
    const signs = {
      zh: [
        "摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座",
        "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"
      ],
      en: [
        "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini",
        "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"
      ]
    };
    const endDates = [19, 18, 20, 19, 20, 20, 22, 22, 22, 23, 22, 21];
    const signList = signs[lang] || signs.zh;
    return day <= endDates[month - 1] ? signList[month - 1] : signList[month];
  }
});



  