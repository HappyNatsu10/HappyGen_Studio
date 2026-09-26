const fs = require('fs');

let content = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');

// 1. Register guest count inheritance
content = content.replace(
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders : ['Uncategorized'];

      // Save user to Firestore
      const newUserProfile = {
        name: name.trim() || 'Creator',
        email: email.trim().toLowerCase(),
        avatar: avatar || DEFAULT_AVATARS[0],
        tier: 'Pro Studio Creator',
        createdAt: new Date().toISOString(),
        generatedCount: 0,`,
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders : ['Uncategorized'];
      const guestCount = currentUser?.isGuest ? (currentUser.generatedCount || 0) : 0;

      // Save user to Firestore
      const newUserProfile = {
        name: name.trim() || 'Creator',
        email: email.trim().toLowerCase(),
        avatar: avatar || DEFAULT_AVATARS[0],
        tier: 'Pro Studio Creator',
        createdAt: new Date().toISOString(),
        generatedCount: guestCount,`
);

// 2. Login email guest count inheritance
content = content.replace(
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      const userCredential = await signInWithEmailAndPassword(auth, email, password);`,
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];
      const guestCount = currentUser?.isGuest ? (currentUser.generatedCount || 0) : 0;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);`
);

// 3. Login email merge block
content = content.replace(
`      // If we had guest favorites, merge them into the account we just logged into
      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          // Merge, avoiding duplicates by id
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`,
`      // If we had guest favorites, merge them into the account we just logged into
      if (guestModels.length > 0 || guestFolders.length > 0 || guestCount > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          // Merge, avoiding duplicates by id
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          finalData.generatedCount = (finalData.generatedCount || 0) + guestCount;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders,
               generatedCount: finalData.generatedCount
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`
);

// 4. Google login
content = content.replace(
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      let finalData = {};`,
`      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];
      const guestCount = currentUser?.isGuest ? (currentUser.generatedCount || 0) : 0;

      let finalData = {};`
);

content = content.replace(
`             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: 0,
             savedPrompts: [],`,
`             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: guestCount,
             savedPrompts: [],`
);

// Google merge
content = content.replace(
`      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`,
`      if (guestModels.length > 0 || guestFolders.length > 0 || guestCount > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          finalData.generatedCount = (finalData.generatedCount || 0) + guestCount;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders,
               generatedCount: finalData.generatedCount
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`
);

// 5. Twitter login
content = content.replace(
`      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      let finalData = {};`,
`      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];
      const guestCount = currentUser?.isGuest ? (currentUser.generatedCount || 0) : 0;

      let finalData = {};`
);

content = content.replace(
`             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: 0,
             savedPrompts: [],`,
`             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: guestCount,
             savedPrompts: [],`
);

// Twitter merge
content = content.replace(
`      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`,
`      if (guestModels.length > 0 || guestFolders.length > 0 || guestCount > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          finalData.generatedCount = (finalData.generatedCount || 0) + guestCount;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders,
               generatedCount: finalData.generatedCount
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }`
);

fs.writeFileSync('src/context/AuthContext.jsx', content);
console.log('Patched AuthContext.jsx successfully.');
