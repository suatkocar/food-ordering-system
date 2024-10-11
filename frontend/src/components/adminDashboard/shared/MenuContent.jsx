import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import StorageIcon from '@mui/icons-material/Storage';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';

const mainListItems = [
  { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
  { text: 'Database', icon: <StorageIcon /> },
  
];

export default function MenuContent({ setSelectedMenuItem, selectedMenuItem }) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={selectedMenuItem === item.text}
              onClick={() => setSelectedMenuItem(item.text)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
