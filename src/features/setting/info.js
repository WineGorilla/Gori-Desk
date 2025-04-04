document.addEventListener("DOMContentLoaded", async () => {
  const birthdayInput = document.getElementById("pet-birthday");
  const zodiacInput = document.getElementById("pet-zodiac");

  // 载入数据库数据
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
    zodiacInput.value = getZodiacSign(date.getMonth() + 1, date.getDate());
  }

  // 宠物生日变动自动计算星座
  birthdayInput.addEventListener("change", () => {
    const date = new Date(birthdayInput.value);
    zodiacInput.value = getZodiacSign(date.getMonth() + 1, date.getDate());
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
    alert("保存成功！");
  });

  // 星座计算函数
  function getZodiacSign(month, day) {
    const signs = [
      "摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座",
      "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"
    ];
    const endDates = [19, 18, 20, 19, 20, 20, 22, 22, 22, 23, 22, 21];
    return day <= endDates[month - 1] ? signs[month - 1] : signs[month];
  }
});


  